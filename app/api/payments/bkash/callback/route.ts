import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { executeBkashPayment, getSiteBaseUrl } from '@/lib/bkash';
import type { BkashPaymentDocument } from '@/lib/types';

function buildRedirectUrl(bookId: string, request: NextRequest, params: Record<string, string | null | undefined>) {
  const baseUrl = getSiteBaseUrl(request.nextUrl.origin);
  const url = new URL(`/books/${bookId}`, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url;
}

async function loadPayment(paymentID: string | null, invoice?: string | null) {
  const payments = await getCollection<BkashPaymentDocument>('bkash_payments');

  if (paymentID) {
    const record = await payments.findOne({ payment_id: paymentID });
    if (record) {
      return { record, payments };
    }
  }

  if (invoice) {
    const record = await payments.findOne({ invoice });
    if (record) {
      return { record, payments };
    }
  }

  return { record: null, payments };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentID = searchParams.get('paymentID');
  const status = (searchParams.get('status') ?? '').toLowerCase();
  const invoice = searchParams.get('invoice') ?? searchParams.get('merchantInvoiceNumber');

  try {
    const { record, payments } = await loadPayment(paymentID, invoice);

    if (!record) {
      return NextResponse.json({ error: 'Payment session not found' }, { status: 404 });
    }

    const bookId = record.book_id;

    if (!paymentID && !record.payment_id) {
      return NextResponse.redirect(
        buildRedirectUrl(bookId, request, {
          paymentStatus: 'failed',
          reason: 'missing-payment-id',
        }),
      );
    }

    if (!record.payment_id && paymentID) {
      await payments.updateOne({ _id: record._id }, { $set: { payment_id: paymentID, updated_at: new Date() } });
      record.payment_id = paymentID;
    }

    const effectivePaymentId = paymentID ?? record.payment_id!;

    if (status === 'cancel' || status === 'cancelled') {
      await payments.updateOne(
        { _id: record._id },
        { $set: { status: 'cancelled', updated_at: new Date(), bkash_error_message: 'User cancelled checkout' } },
      );
      return NextResponse.redirect(
        buildRedirectUrl(bookId, request, {
          paymentStatus: 'cancelled',
        }),
      );
    }

    if (status === 'failure' || status === 'failed') {
      await payments.updateOne(
        { _id: record._id },
        { $set: { status: 'failed', updated_at: new Date(), bkash_error_message: 'Checkout failed' } },
      );
      return NextResponse.redirect(
        buildRedirectUrl(bookId, request, {
          paymentStatus: 'failed',
        }),
      );
    }

    if (record.status === 'executed') {
      return NextResponse.redirect(
        buildRedirectUrl(bookId, request, {
          paymentStatus: 'success',
          paymentID: record.payment_id,
        }),
      );
    }

    try {
      const execution = await executeBkashPayment(effectivePaymentId);

      await payments.updateOne(
        { _id: record._id },
        {
          $set: {
            status: 'executed',
            bkash_trx_id: execution.trxID,
            customer_msisdn: execution.customerMsisdn ?? null,
            updated_at: new Date(),
          },
        },
      );

      return NextResponse.redirect(
        buildRedirectUrl(bookId, request, {
          paymentStatus: 'success',
          paymentID: execution.paymentID,
        }),
      );
    } catch (error) {
      console.error('Failed to execute bKash payment', error);
      await payments.updateOne(
        { _id: record._id },
        {
          $set: {
            status: 'failed',
            bkash_error_message: (error as Error).message,
            updated_at: new Date(),
          },
        },
      );

      return NextResponse.redirect(
        buildRedirectUrl(bookId, request, {
          paymentStatus: 'failed',
        }),
      );
    }
  } catch (error) {
    console.error('bKash callback handler error', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
