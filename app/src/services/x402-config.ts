import { x402API } from '../utils/x402';

export async function getX402Config() {
  return {
    stxEndpoint: 'https://x402-api.aibtc.dev/v1/stx',
    sbtcEndpoint: 'https://x402-api.aibtc.dev/v1/sbtc',
    usdcxEndpoint: 'https://x402-api.aibtc.dev/v1/usdcx',
  };
}

export async function getX402PaymentHeaders(amount: number, recipient: string, requestId: string) {
  return {
    'X-402-Amount': amount.toString(),
    'X-402-Recipient': recipient,
    'X-402-Request-ID': requestId,
  };
}
