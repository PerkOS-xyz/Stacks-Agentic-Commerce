// x402 Payment API
export interface PaymentRequest {
  recipient: string;
  amount: number;
  jobId: number;
  token: 'stx' | 'sbtc' | 'usdcx';
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  timestamp: number;
}

export interface CheckPaymentResponse {
  paid: boolean;
  transactionId?: string;
  amount?: number;
}

export const x402API = {
  async payment(payment: PaymentRequest): Promise<PaymentResponse> {
    const endpoint = `https://x402-api.aibtc.dev/v1/${payment.token}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: payment.recipient,
        amount: payment.amount,
        job_id: payment.jobId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Payment failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      transactionId: data.transaction_id,
      timestamp: Date.now(),
    };
  },

  async checkPayment(jobId: number): Promise<CheckPaymentResponse> {
    const endpoint = `https://x402-api.aibtc.dev/v1/check/${jobId}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Payment check failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      paid: data.paid,
      transactionId: data.transaction_id,
      amount: data.amount,
    };
  },

  async createInvoice(recipient: string, amount: number, token: 'stx' | 'sbtc' | 'usdcx'): Promise<{ invoice: string }> {
    const endpoint = `https://x402-api.aibtc.dev/v1/${token}/invoice`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error(`Invoice creation failed: ${response.status}`);
    }

    const data = await response.json();
    return { invoice: data.invoice };
  },
};
