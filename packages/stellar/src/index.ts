import {
  getAddress,
  getNetwork,
  isConnected,
  setAllowed,
  signTransaction
} from '@stellar/freighter-api';
import {
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  xdr
} from '@stellar/stellar-sdk';

export interface NetworkConfig {
  network: 'testnet' | 'mainnet';
  rpcUrl: string;
  networkPassphrase: string;
  explorerUrl: string;
}

export const TESTNET_CONFIG: NetworkConfig = {
  network: 'testnet',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  explorerUrl: 'https://stellar.expert/explorer/testnet'
};

export interface WalletConnectionState {
  isConnected: boolean;
  address?: string;
  network?: string;
}

export class StellarClient {
  private config: NetworkConfig;

  constructor(config: NetworkConfig = TESTNET_CONFIG) {
    this.config = config;
  }

  public getExplorerTxUrl(txHash: string): string {
    return `${this.config.explorerUrl}/tx/${txHash}`;
  }

  public getExplorerContractUrl(contractAddress: string): string {
    return `${this.config.explorerUrl}/contract/${contractAddress}`;
  }

  public async checkWalletConnection(): Promise<WalletConnectionState> {
    if (typeof window === 'undefined') return { isConnected: false };

    try {
      const connection = await isConnected();
      if (connection.error || !connection.isConnected) return { isConnected: false };

      const [account, networkDetails] = await Promise.all([getAddress(), getNetwork()]);
      if (account.error || networkDetails.error || !account.address) return { isConnected: false };
      return { isConnected: true, address: account.address, network: networkDetails.network };
    } catch (err) {
      console.warn('Freighter wallet connection query failed:', err);
      return { isConnected: false };
    }
  }

  public async requestWalletConnect(): Promise<WalletConnectionState> {
    if (typeof window === 'undefined') throw new Error('Wallet connection is only available in a browser.');

    const connection = await isConnected();
    if (connection.error || !connection.isConnected) {
      throw new Error('Freighter is not available. Install or enable the Freighter browser extension, then reload this page.');
    }

    const permission = await setAllowed();
    if (permission.error || !permission.isAllowed) {
      throw new Error('Freighter access was not approved. Open the extension and allow this site.');
    }

    const [account, networkDetails] = await Promise.all([getAddress(), getNetwork()]);
    if (account.error || !account.address) throw new Error('Freighter did not return an account address.');
    if (networkDetails.error) throw new Error('Freighter did not return its active network.');

    return { isConnected: true, address: account.address, network: networkDetails.network };
  }

  public calculateBasisPoints(percentages: number[]): number[] {
    const bps = percentages.map(p => Math.round(p * 100));
    const total = bps.reduce((acc, curr) => acc + curr, 0);
    if (total !== 10000) {
      throw new Error(`Total allocation percentage must equal 100% (10,000 BPS), got ${total / 100}%`);
    }
    return bps;
  }

  public formatBaseUnits(amountStr: string, decimals: number = 7): string {
    if (!/^\d+(\.\d+)?$/.test(amountStr)) throw new Error('Invalid payment amount');
    const [whole, fraction = ''] = amountStr.split('.');
    if (fraction.length > decimals) throw new Error(`Payment amount supports at most ${decimals} decimals`);
    const value = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0'));
    if (value <= 0n) throw new Error('Invalid payment amount');
    return value.toString();
  }

  public async distribute(
    contractId: string,
    payer: string,
    amount: string,
    paymentRef: string
  ): Promise<string> {
    if (typeof window === 'undefined') throw new Error('Transactions can only be signed in a browser.');
    if (!/^[A-Za-z0-9_]{1,32}$/.test(paymentRef)) {
      throw new Error('Payment reference must contain 1-32 letters, numbers, or underscores.');
    }

    const server = new rpc.Server(this.config.rpcUrl);
    const source = await server.getAccount(payer);
    const contract = new Contract(contractId);
    const transaction = new TransactionBuilder(source, {
      fee: '1000000',
      networkPassphrase: this.config.networkPassphrase
    })
      .addOperation(
        contract.call(
          'distribute',
          nativeToScVal(payer, { type: 'address' }),
          nativeToScVal(BigInt(amount), { type: 'i128' }),
          xdr.ScVal.scvSymbol(paymentRef)
        )
      )
      .setTimeout(180)
      .build();
    const prepared = await server.prepareTransaction(transaction);
    const signed = await signTransaction(prepared.toXDR(), {
      networkPassphrase: this.config.networkPassphrase,
      address: payer
    });
    if (signed.error || !signed.signedTxXdr) throw new Error('Freighter did not return a signed transaction.');

    const submitted = await server.sendTransaction(
      TransactionBuilder.fromXDR(signed.signedTxXdr, this.config.networkPassphrase)
    );
    if (submitted.status === 'ERROR') throw new Error('Stellar RPC rejected the transaction.');

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await server.getTransaction(submitted.hash);
      if (result.status === 'SUCCESS') return submitted.hash;
      if (result.status === 'FAILED') throw new Error('The Soroban transaction failed.');
    }
    throw new Error('Transaction confirmation timed out. Check the transaction in Stellar Explorer.');
  }
}

export const stellarClient = new StellarClient();
