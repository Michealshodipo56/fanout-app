import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

export interface BeneficiaryRecord { address: string; allocationBps: number; }
export interface AgreementRecord {
  id: string; contractAddress: string; name: string; creatorAddress: string;
  acceptedAsset: string; status: 'Active' | 'Suspended' | 'Closed'; version: number;
  requiredApprovals: number; totalDistributed: string; transactionCount: number;
  beneficiaries: BeneficiaryRecord[]; createdAt: Date;
}
export interface PaymentRecord {
  id: string; paymentRef: string; agreementId: string; payerAddress: string;
  amount: string; assetAddress: string; txHash: string; ledgerSequence: number;
  status: 'Succeeded' | 'Failed'; configVersion: number;
  distributions: { beneficiaryAddress: string; amount: string; allocationBps: number }[];
  createdAt: Date;
}
export interface ProposalRecord {
  id: string; proposalOnchainId: number; agreementId: string; proposerAddress: string;
  newBeneficiaries: BeneficiaryRecord[]; approvals: string[];
  status: 'Pending' | 'Approved' | 'Executed' | 'Rejected'; configVersion: number;
  createdAt: Date;
}

const MIGRATION = `
CREATE TABLE IF NOT EXISTS agreements (id VARCHAR(64) PRIMARY KEY, contract_address VARCHAR(56) NOT NULL UNIQUE, name VARCHAR(255) NOT NULL, creator_address VARCHAR(56) NOT NULL, accepted_asset VARCHAR(56) NOT NULL, status VARCHAR(32) NOT NULL DEFAULT 'Active', version INT NOT NULL DEFAULT 1, required_approvals INT NOT NULL DEFAULT 1, total_distributed NUMERIC(38,0) NOT NULL DEFAULT 0, transaction_count BIGINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS agreement_beneficiaries (id UUID PRIMARY KEY, agreement_id VARCHAR(64) NOT NULL REFERENCES agreements(id) ON DELETE CASCADE, beneficiary_address VARCHAR(56) NOT NULL, allocation_bps INT NOT NULL CHECK (allocation_bps > 0 AND allocation_bps <= 10000), config_version INT NOT NULL DEFAULT 1, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE (agreement_id, beneficiary_address, config_version));
CREATE TABLE IF NOT EXISTS payments (id VARCHAR(64) PRIMARY KEY, payment_ref VARCHAR(64) NOT NULL, agreement_id VARCHAR(64) NOT NULL REFERENCES agreements(id) ON DELETE CASCADE, payer_address VARCHAR(56) NOT NULL, amount NUMERIC(38,0) NOT NULL, asset_address VARCHAR(56) NOT NULL, tx_hash VARCHAR(64) NOT NULL UNIQUE, ledger_sequence BIGINT NOT NULL, status VARCHAR(32) NOT NULL DEFAULT 'Succeeded', config_version INT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE (agreement_id, payment_ref));
CREATE TABLE IF NOT EXISTS payment_distributions (id UUID PRIMARY KEY, payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE CASCADE, beneficiary_address VARCHAR(56) NOT NULL, amount NUMERIC(38,0) NOT NULL, allocation_bps INT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS indexer_checkpoints (contract_address VARCHAR(56) PRIMARY KEY, paging_token VARCHAR(64) NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_agreements_creator ON agreements(creator_address);
CREATE INDEX IF NOT EXISTS idx_payments_agreement ON payments(agreement_id);`;

export class Database {
  private pool?: Pool;
  private initialized?: Promise<void>;
  private agreements = new Map<string, AgreementRecord>();
  private payments: PaymentRecord[] = [];

  constructor(connectionString = process.env.DATABASE_URL) {
    if (connectionString) this.pool = new Pool({ connectionString, max: 5, ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false } });
  }
  get mode(): 'postgres' | 'memory' { return this.pool ? 'postgres' : 'memory'; }
  async ready(): Promise<void> { if (!this.pool) return; this.initialized ??= this.pool.query(MIGRATION).then(() => undefined); await this.initialized; }
  async health(): Promise<void> { await this.ready(); if (this.pool) await this.pool.query('SELECT 1'); }

  async getAgreements(): Promise<AgreementRecord[]> {
    if (!this.pool) return Array.from(this.agreements.values());
    await this.ready();
    const { rows } = await this.pool.query(`SELECT a.*, COALESCE(json_agg(json_build_object('address',b.beneficiary_address,'allocationBps',b.allocation_bps)) FILTER (WHERE b.id IS NOT NULL),'[]') beneficiaries FROM agreements a LEFT JOIN agreement_beneficiaries b ON b.agreement_id=a.id AND b.config_version=a.version GROUP BY a.id ORDER BY a.created_at DESC`);
    return rows.map(mapAgreement);
  }
  async getAgreementById(id: string): Promise<AgreementRecord | undefined> {
    if (!this.pool) return this.agreements.get(id);
    await this.ready();
    const { rows } = await this.pool.query(`SELECT a.*, COALESCE(json_agg(json_build_object('address',b.beneficiary_address,'allocationBps',b.allocation_bps)) FILTER (WHERE b.id IS NOT NULL),'[]') beneficiaries FROM agreements a LEFT JOIN agreement_beneficiaries b ON b.agreement_id=a.id AND b.config_version=a.version WHERE a.id=$1 GROUP BY a.id`,[id]);
    return rows[0] ? mapAgreement(rows[0]) : undefined;
  }
  async getAgreementByContract(address:string):Promise<AgreementRecord|undefined>{const agreements=await this.getAgreements();return agreements.find(item=>item.contractAddress===address);}
  async createAgreement(record: AgreementRecord): Promise<AgreementRecord> {
    if (!this.pool) { this.agreements.set(record.id,record); return record; }
    await this.ready(); const client=await this.pool.connect();
    try { await client.query('BEGIN');
      await client.query(`INSERT INTO agreements(id,contract_address,name,creator_address,accepted_asset,status,version,required_approvals,total_distributed,transaction_count,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,[record.id,record.contractAddress,record.name,record.creatorAddress,record.acceptedAsset,record.status,record.version,record.requiredApprovals,record.totalDistributed,record.transactionCount,record.createdAt]);
      for(const b of record.beneficiaries) await client.query(`INSERT INTO agreement_beneficiaries(id,agreement_id,beneficiary_address,allocation_bps,config_version) VALUES($1,$2,$3,$4,$5)`,[randomUUID(),record.id,b.address,b.allocationBps,record.version]);
      await client.query('COMMIT'); return record;
    } catch(error){ await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }
  async addPayment(payment: PaymentRecord): Promise<boolean> {
    if(!this.pool){ if(this.payments.some(p=>p.txHash===payment.txHash)) return false; this.payments.push(payment); const a=this.agreements.get(payment.agreementId); if(a){a.totalDistributed=(BigInt(a.totalDistributed)+BigInt(payment.amount)).toString();a.transactionCount+=1;} return true; }
    await this.ready(); const client=await this.pool.connect();
    try { await client.query('BEGIN'); const inserted=await client.query(`INSERT INTO payments(id,payment_ref,agreement_id,payer_address,amount,asset_address,tx_hash,ledger_sequence,status,config_version,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING RETURNING id`,[payment.id,payment.paymentRef,payment.agreementId,payment.payerAddress,payment.amount,payment.assetAddress,payment.txHash,payment.ledgerSequence,payment.status,payment.configVersion,payment.createdAt]);
      if(!inserted.rowCount){await client.query('ROLLBACK');return false;}
      for(const d of payment.distributions) await client.query(`INSERT INTO payment_distributions(id,payment_id,beneficiary_address,amount,allocation_bps) VALUES($1,$2,$3,$4,$5)`,[randomUUID(),payment.id,d.beneficiaryAddress,d.amount,d.allocationBps]);
      await client.query(`UPDATE agreements SET total_distributed=total_distributed+$1,transaction_count=transaction_count+1,updated_at=NOW() WHERE id=$2`,[payment.amount,payment.agreementId]); await client.query('COMMIT'); return true;
    } catch(error){await client.query('ROLLBACK');throw error;} finally {client.release();}
  }
  async getPaymentsForAgreement(id:string):Promise<PaymentRecord[]>{return this.getPayments(id);}
  async getRecentPayments():Promise<PaymentRecord[]>{return this.getPayments();}
  private async getPayments(agreementId?:string):Promise<PaymentRecord[]>{
    if(!this.pool)return [...this.payments].filter(p=>!agreementId||p.agreementId===agreementId).reverse().slice(0,20);
    await this.ready(); const where=agreementId?'WHERE p.agreement_id=$1':''; const {rows}=await this.pool.query(`SELECT p.*,COALESCE(json_agg(json_build_object('beneficiaryAddress',d.beneficiary_address,'amount',d.amount::text,'allocationBps',d.allocation_bps)) FILTER(WHERE d.id IS NOT NULL),'[]') distributions FROM payments p LEFT JOIN payment_distributions d ON d.payment_id=p.id ${where} GROUP BY p.id ORDER BY p.created_at DESC LIMIT 20`,agreementId?[agreementId]:[]);
    return rows.map(r=>({id:r.id,paymentRef:r.payment_ref,agreementId:r.agreement_id,payerAddress:r.payer_address,amount:String(r.amount),assetAddress:r.asset_address,txHash:r.tx_hash,ledgerSequence:Number(r.ledger_sequence),status:r.status,configVersion:r.config_version,distributions:r.distributions,createdAt:new Date(r.created_at)}));
  }
  async getCheckpoint(address:string):Promise<string|undefined>{if(!this.pool)return undefined;await this.ready();const r=await this.pool.query('SELECT paging_token FROM indexer_checkpoints WHERE contract_address=$1',[address]);return r.rows[0]?.paging_token;}
  async setCheckpoint(address:string,token:string):Promise<void>{if(!this.pool)return;await this.ready();await this.pool.query(`INSERT INTO indexer_checkpoints(contract_address,paging_token) VALUES($1,$2) ON CONFLICT(contract_address) DO UPDATE SET paging_token=EXCLUDED.paging_token,updated_at=NOW()`,[address,token]);}
}

function mapAgreement(r:any):AgreementRecord{return{id:r.id,contractAddress:r.contract_address,name:r.name,creatorAddress:r.creator_address,acceptedAsset:r.accepted_asset,status:r.status,version:r.version,requiredApprovals:r.required_approvals,totalDistributed:String(r.total_distributed),transactionCount:Number(r.transaction_count),beneficiaries:r.beneficiaries,createdAt:new Date(r.created_at)};}
export const db=new Database();
