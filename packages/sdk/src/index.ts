export interface FanoutClientConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface BeneficiaryAllocation {
  address: string;
  allocationBps: number;
}

export interface AgreementResponse {
  id: string;
  contractAddress: string;
  name: string;
  creatorAddress: string;
  acceptedAsset: string;
  status: string;
  version: number;
  beneficiaries: BeneficiaryAllocation[];
  totalDistributed: string;
}

export interface CreatePaymentRequestOptions {
  agreementId: string;
  amount: string;
  payerAddress: string;
  reference?: string;
}

export interface PaymentRequestResponse {
  paymentRef: string;
  paymentUrl: string;
  agreementId: string;
  amount: string;
  status: string;
}

export class FanoutClient {
  private apiKey?: string;
  private baseUrl: string;

  constructor(config: FanoutClientConfig = {}) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.fanout.network';
  }

  public async getAgreement(agreementId: string): Promise<AgreementResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/agreements/${agreementId}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch agreement: ${res.statusText}`);
    }
    return res.json();
  }

  public async createPaymentRequest(
    options: CreatePaymentRequestOptions
  ): Promise<PaymentRequestResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/payments/requests`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(options)
    });
    if (!res.ok) {
      throw new Error(`Failed to create payment request: ${res.statusText}`);
    }
    return res.json();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    return headers;
  }
}
