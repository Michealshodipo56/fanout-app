export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface BeneficiaryRecord {
  address: string;
  allocationBps: number;
}

export interface AgreementRecord {
  id: string;
  contractAddress: string;
  name: string;
  creatorAddress: string;
  acceptedAsset: string;
  status: 'Active' | 'Suspended' | 'Closed';
  version: number;
  requiredApprovals: number;
  totalDistributed: string;
  transactionCount: number;
  beneficiaries: BeneficiaryRecord[];
  createdAt: Date;
}

export interface PaymentRecord {
  id: string;
  paymentRef: string;
  agreementId: string;
  payerAddress: string;
  amount: string;
  assetAddress: string;
  txHash: string;
  ledgerSequence: number;
  status: 'Succeeded' | 'Failed';
  configVersion: number;
  distributions: { beneficiaryAddress: string; amount: string; allocationBps: number }[];
  createdAt: Date;
}

export interface ProposalRecord {
  id: string;
  proposalOnchainId: number;
  agreementId: string;
  proposerAddress: string;
  newBeneficiaries: BeneficiaryRecord[];
  approvals: string[];
  status: 'Pending' | 'Approved' | 'Executed' | 'Rejected';
  configVersion: number;
  createdAt: Date;
}

// In-Memory Durable Store for Dev / Testing
class InMemoryDatabase {
  private agreements: Map<string, AgreementRecord> = new Map();
  private payments: PaymentRecord[] = [];
  private proposals: Map<string, ProposalRecord> = new Map();

  public getAgreements(): AgreementRecord[] {
    return Array.from(this.agreements.values());
  }

  public getAgreementById(id: string): AgreementRecord | undefined {
    return this.agreements.get(id);
  }

  public createAgreement(record: AgreementRecord): AgreementRecord {
    this.agreements.set(record.id, record);
    return record;
  }

  public updateAgreementStatus(id: string, status: 'Active' | 'Suspended' | 'Closed'): boolean {
    const agr = this.agreements.get(id);
    if (!agr) return false;
    agr.status = status;
    return true;
  }

  public addPayment(payment: PaymentRecord): void {
    this.payments.push(payment);
    const agr = this.agreements.get(payment.agreementId);
    if (agr) {
      agr.totalDistributed = (BigInt(agr.totalDistributed) + BigInt(payment.amount)).toString();
      agr.transactionCount += 1;
    }
  }

  public getPaymentsForAgreement(agreementId: string): PaymentRecord[] {
    return this.payments.filter(p => p.agreementId === agreementId);
  }

  public getRecentPayments(): PaymentRecord[] {
    return [...this.payments].reverse().slice(0, 20);
  }

  public createProposal(prop: ProposalRecord): ProposalRecord {
    this.proposals.set(prop.id, prop);
    return prop;
  }

  public getProposalsForAgreement(agreementId: string): ProposalRecord[] {
    return Array.from(this.proposals.values()).filter(p => p.agreementId === agreementId);
  }
}

export const db = new InMemoryDatabase();
