import { rpc, scValToNative } from '@stellar/stellar-sdk';
import { TESTNET_CONFIG } from '@fanout/stellar';
import { db, type PaymentRecord } from '@fanout/database';

const POLL_MS=Number(process.env.INDEXER_POLL_MS||5000);
const contractIds=(process.env.FANOUT_CONTRACT_IDS||'').split(',').map(v=>v.trim()).filter(Boolean);
const server=new rpc.Server(process.env.STELLAR_RPC_URL||TESTNET_CONFIG.rpcUrl);

export class SorobanEventIndexer {
  private running=false;
  async start():Promise<void>{
    if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required for the indexer');
    if(!contractIds.length)throw new Error('FANOUT_CONTRACT_IDS must contain at least one deployed contract ID');
    await db.health();this.running=true;console.log(`[indexer] watching ${contractIds.length} contract(s)`);
    while(this.running){try{await this.pollEvents();}catch(error){console.error('[indexer] poll failed',error);}await new Promise(resolve=>setTimeout(resolve,POLL_MS));}
  }
  stop():void{this.running=false;}
  private async pollEvents():Promise<void>{
    for(const contractId of contractIds){
      const checkpoint=await db.getCheckpoint(contractId);
      const latest=await server.getLatestLedger();
      const response=await server.getEvents({startLedger:checkpoint?undefined:Math.max(1,latest.sequence-100),cursor:checkpoint,filters:[{type:'contract',contractIds:[contractId]}],limit:100});
      for(const event of response.events){await this.ingest(contractId,event as any);await db.setCheckpoint(contractId,event.id);}
    }
  }
  private async ingest(contractId:string,event:any):Promise<void>{
    const topic=(event.topic||[]).map((value:any)=>scValToNative(value));
    if(topic[0]!=='pay_dist')return;
    const agreement=await db.getAgreementByContract(contractId);if(!agreement){console.warn(`[indexer] unregistered contract ${contractId}`);return;}
    const [amount,paymentRef]=scValToNative(event.value) as [bigint,string,number];
    const allocations=splitAmount(BigInt(amount),agreement.beneficiaries);
    const payment:PaymentRecord={id:event.txHash,paymentRef:String(paymentRef),agreementId:agreement.id,payerAddress:String(topic[1]),amount:String(amount),assetAddress:agreement.acceptedAsset,txHash:event.txHash,ledgerSequence:event.ledger,status:'Succeeded',configVersion:agreement.version,distributions:allocations,createdAt:new Date(event.ledgerClosedAt||Date.now())};
    if(await db.addPayment(payment))console.log(`[indexer] indexed ${event.txHash}`);
  }
}

export function splitAmount(amount:bigint,beneficiaries:{address:string;allocationBps:number}[]){
  const payouts=beneficiaries.map((b,index)=>({beneficiaryAddress:b.address,allocationBps:b.allocationBps,amount:amount*BigInt(b.allocationBps)/10000n,remainder:amount*BigInt(b.allocationBps)%10000n,index}));
  let leftover=amount-payouts.reduce((sum,p)=>sum+p.amount,0n);for(const payout of [...payouts].sort((a,b)=>a.remainder===b.remainder?a.index-b.index:a.remainder>b.remainder?-1:1)){if(leftover===0n)break;payout.amount+=1n;leftover-=1n;}
  return payouts.map(({beneficiaryAddress,allocationBps,amount})=>({beneficiaryAddress,allocationBps,amount:amount.toString()}));
}

if(require.main===module){const indexer=new SorobanEventIndexer();process.on('SIGTERM',()=>indexer.stop());process.on('SIGINT',()=>indexer.stop());indexer.start().catch(error=>{console.error(error);process.exit(1);});}
