import { randomUUID } from 'node:crypto';

type TokenGrantResponse = {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
};

type BkashErrorPayload = {
  statusCode?: string;
  errorCode?: string;
  errorMessage?: string;
  message?: string;
};

type CreatePaymentPayload = {
  amount: string;
  invoice: string;
  callbackURL: string;
  payerReference: string;
};

export type BkashCreateResponse = {
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL?: string;
  failureCallbackURL?: string;
  cancelledCallbackURL?: string;
};

export type BkashExecuteResponse = {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  payerReference?: string;
  customerMsisdn?: string;
};

type TokenCache = {
  token: string;
  expiresAt: number;
};

const PLACEHOLDER_VALUES = new Set([
  'your-sandbox-app-key',
  'your-sandbox-app-secret',
  'sandbox-username',
  'sandbox-password',
  'replace-me',
]);

const {
  BKASH_BASE_URL = 'https://tokenized.sandbox.bka.sh',
  BKASH_CHECKOUT_VERSION = 'v1.2.0-beta',
  BKASH_APP_KEY,
  BKASH_APP_SECRET,
  BKASH_USERNAME,
  BKASH_PASSWORD,
  BKASH_CALLBACK_URL,
} = process.env;

const CHECKOUT_BASE = `${BKASH_BASE_URL.replace(/\/$/, '')}/${BKASH_CHECKOUT_VERSION}/tokenized/checkout`;

let cachedToken: TokenCache | null = null;

export class BkashError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

export function assertBkashConfig() {
  if (!BKASH_APP_KEY || !BKASH_APP_SECRET || !BKASH_USERNAME || !BKASH_PASSWORD || !BKASH_CALLBACK_URL) {
    throw new Error(
      'Missing bKash configuration. Ensure BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, BKASH_PASSWORD, and BKASH_CALLBACK_URL are configured.',
    );
  }

  if (
    PLACEHOLDER_VALUES.has(BKASH_APP_KEY) ||
    PLACEHOLDER_VALUES.has(BKASH_APP_SECRET) ||
    PLACEHOLDER_VALUES.has(BKASH_USERNAME) ||
    PLACEHOLDER_VALUES.has(BKASH_PASSWORD)
  ) {
    throw new Error(
      'bKash sandbox credentials are still using placeholder values. Replace them with the real sandbox keys from developer.bka.sh.',
    );
  }
}

function parseBkashError(payload: BkashErrorPayload | null, fallback?: string): string {
  if (!payload || Object.keys(payload).length === 0) {
    if (fallback && fallback.trim().length > 0) {
      return fallback.trim();
    }
    return 'Unknown bKash error';
  }
  return (
    payload.errorMessage ??
    payload.message ??
    payload.errorCode ??
    payload.statusCode ??
    fallback?.trim() ??
    'Unknown bKash error'
  );
}

async function grantToken(): Promise<TokenGrantResponse> {
  assertBkashConfig();

  const response = await fetch(`${CHECKOUT_BASE}/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      username: BKASH_USERNAME as string,
      password: BKASH_PASSWORD as string,
      'x-app-key': BKASH_APP_KEY as string,
    },
    body: JSON.stringify({
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    }),
    cache: 'no-store',
  });

  const rawBody = await response.text();
  if (!response.ok) {
    let payload: BkashErrorPayload | null = null;
    try {
      payload = JSON.parse(rawBody) as BkashErrorPayload;
    } catch {
      payload = null;
    }
    throw new BkashError(parseBkashError(payload, rawBody || response.statusText), payload?.errorCode);
  }

  let payload: Partial<TokenGrantResponse> = {};
  try {
    payload = rawBody ? (JSON.parse(rawBody) as Partial<TokenGrantResponse>) : {};
  } catch {
    payload = {};
  }

  if (!payload.id_token || !payload.expires_in) {
    throw new BkashError('bKash token response is missing id_token or expires_in.');
  }

  return {
    id_token: payload.id_token,
    token_type: payload.token_type ?? 'Bearer',
    expires_in: Number(payload.expires_in),
    refresh_token: payload.refresh_token,
  };
}

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60 * 1000) {
    return cachedToken.token;
  }

  const payload = await grantToken();
  cachedToken = {
    token: payload.id_token,
    expiresAt: now + Math.max(60, payload.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

async function bkashPost<TResponse>(path: string, body: any): Promise<TResponse> {
  const token = await getToken();

  const response = await fetch(`${CHECKOUT_BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      authorization: token,
      'x-app-key': BKASH_APP_KEY as string,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => ({}))) as BkashErrorPayload & Record<string, any>;

  if (!response.ok || payload.errorCode) {
    throw new BkashError(parseBkashError(payload), payload.errorCode);
  }

  return payload as TResponse;
}

export async function createBkashPayment(payload: CreatePaymentPayload): Promise<BkashCreateResponse> {
  const body = {
    mode: '0011',
    payerReference: payload.payerReference || 'BOOK',
    callbackURL: payload.callbackURL,
    amount: payload.amount,
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: payload.invoice,
    merchantAssociationInfo: randomUUID().slice(0, 10),
  };

  return bkashPost<BkashCreateResponse>('create', body);
}

export async function executeBkashPayment(paymentID: string): Promise<BkashExecuteResponse> {
  if (!paymentID) {
    throw new BkashError('Missing paymentID for execution.');
  }

  return bkashPost<BkashExecuteResponse>('execute', { paymentID });
}

export function getBkashCallbackUrl(): string {
  if (!BKASH_CALLBACK_URL) {
    throw new Error('BKASH_CALLBACK_URL is not configured.');
  }
  return BKASH_CALLBACK_URL;
}

export function getSiteBaseUrl(requestOrigin?: string): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_BASE_URL ?? requestOrigin ?? 'http://localhost:3000';
}
