import { TESTNET_CONFIG } from '@fanout/stellar';
import { db, PaymentRecord } from '@fanout/database';

export class SorobanEventIndexer {
  private lastIndexedLedger: number = 0;
  private isRunning: boolean = false;
  private processedTxs: Set<string> = new Set();

  constructor() {
    console.log(`[Indexer] Initialized for ${TESTNET_CONFIG.network} (${TESTNET_CONFIG.rpcUrl})`);
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    console.log('[Indexer] Soroban event ingestion worker running...');
    
    // Periodical polling loop
    while (this.isRunning) {
      try {
        await this.pollEvents();
      } catch (err) {
        console.error('[Indexer] Error polling Soroban RPC events:', err);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  public stop(): void {
    this.isRunning = false;
    console.log('[Indexer] Worker stopped.');
  }

  private async pollEvents(): Promise<void> {
    const currentLedger = Math.floor(Date.now() / 1000);
    if (this.lastIndexedLedger === 0) {
      this.lastIndexedLedger = currentLedger - 100;
    }

    // Process simulated contract events
    this.lastIndexedLedger = currentLedger;
  }

  public ingestPaymentEvent(evt: {
    txHash: string;
    agreementId: string;
    payerAddress: string;
    amount: string;
    paymentRef: string;
    ledgerSequence: number;
    distributions: { beneficiaryAddress: string; amount: string; allocationBps: number }[];
  }): boolean {
    if (this.processedTxs.has(evt.txHash)) {
      console.log(`[Indexer] Skipping duplicate txHash: ${evt.txHash}`);
      return false;
    }

    const record: PaymentRecord = {
      id: `pay_${Date.now()}`,
      paymentRef: evt.paymentRef,
      agreementId: evt.agreementId,
      payerAddress: evt.payerAddress,
      amount: evt.amount,
      assetAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMWAXA72PP2FFF',
      txHash: evt.txHash,
      ledgerSequence: evt.ledgerSequence,
      status: 'Succeeded',
      configVersion: 1,
      distributions: evt.distributions,
      createdAt: new Date()
    };

    db.addPayment(record);
    this.processedTxs.add(evt.txHash);
    console.log(`[Indexer] Successfully ingested on-chain payment ${evt.paymentRef} (${evt.amount} base units)`);
    return true;
  }
}

if (require.main === module) {
  const indexer = new SorobanEventIndexer();
  indexer.start();
}
