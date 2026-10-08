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
    if (typeof window !== 'undefined' && (window as any).freighter) {
      try {
        const isConnected = await (window as any).freighter.isConnected();
        if (isConnected) {
          const address = await (window as any).freighter.getAddress();
          const network = await (window as any).freighter.getNetwork();
          return { isConnected: true, address, network };
        }
      } catch (err) {
        console.warn('Freighter wallet connection query failed:', err);
      }
    }
    return { isConnected: false };
  }

  public async requestWalletConnect(): Promise<WalletConnectionState> {
    if (typeof window !== 'undefined' && (window as any).freighter) {
      try {
        const address = await (window as any).freighter.requestAccess();
        const network = await (window as any).freighter.getNetwork();
        return { isConnected: true, address, network };
      } catch (err) {
        throw new Error(`Wallet connection rejected by user: ${err}`);
      }
    }
    throw new Error('Freighter Wallet extension is not installed. Please install Freighter to connect.');
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
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) throw new Error("Invalid payment amount");
    return BigInt(Math.round(val * Math.pow(10, decimals))).toString();
  }
}

export const stellarClient = new StellarClient();
