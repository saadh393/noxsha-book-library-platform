import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { BkashError, assertBkashConfig, createBkashPayment, getBkashCallbackUrl } from '@/lib/bkash';
import type { BkashPaymentDocument, BookDocument } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    assertBkashConfig();
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const bookId = payload?.bookId;

  if (!bookId || typeof bookId !== 'string') {
    return NextResponse.json({ error: 'bookId is required' }, { status: 400 });
  }

  try {
    const booksCollection = await getCollection<BookDocument>('books');
    const book = await booksCollection.findOne({ _id: bookId });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (!book.pdf_storage_name) {
      return NextResponse.json({ error: 'এই বইটির জন্য পিডিএফ ফাইল যোগ করা হয়নি।' }, { status: 400 });
    }

    if (!book.price || Number(book.price) <= 0) {
      return NextResponse.json({ error: 'এই বইটি বিনামূল্যে ডাউনলোড করা যায়।' }, { status: 400 });
    }

    const amountNumber = Number(book.price);
    const amount = amountNumber.toFixed(2);
    const invoice = `BK-${book.id}-${Date.now()}`;
    const callbackUrl = `${getBkashCallbackUrl()}?invoice=${encodeURIComponent(invoice)}`;
    const paymentsCollection = await getCollection<BkashPaymentDocument>('bkash_payments');
    const now = new Date();
    const paymentRecord: BkashPaymentDocument = {
      _id: randomUUID(),
      payment_id: null,
      book_id: book.id,
      book_title: book.title ?? null,
      invoice,
      amount: amountNumber,
      currency: 'BDT',
      status: 'initiated',
      bkash_trx_id: null,
      customer_msisdn: null,
      payer_reference: `BOOK-${book.id}`,
      metadata: {
        requestedBy: payload?.customer ?? null,
      },
      created_at: now,
      updated_at: now,
    };

    await paymentsCollection.insertOne(paymentRecord);

    try {
      const bkashResponse = await createBkashPayment({
        amount,
        callbackURL: callbackUrl,
        invoice,
        payerReference: paymentRecord.payer_reference ?? `BOOK-${book.id}`,
      });

      await paymentsCollection.updateOne(
        { _id: paymentRecord._id },
        {
          $set: {
            payment_id: bkashResponse.paymentID,
            status: 'pending_execution',
            updated_at: new Date(),
          },
        },
      );

      return NextResponse.json({
        paymentID: bkashResponse.paymentID,
        redirectUrl: bkashResponse.bkashURL,
        invoice,
      });
    } catch (error) {
      await paymentsCollection.updateOne(
        { _id: paymentRecord._id },
        {
          $set: {
            status: 'create_failed',
            bkash_error_message: (error as Error).message,
            updated_at: new Date(),
          },
        },
      );
      throw error;
    }
  } catch (error) {
    console.error('Failed to create bKash payment session', error);
    if (error instanceof BkashError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 },
      );
    }
    if (error instanceof Error && /placeholder/i.test(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'bKash পেমেন্ট শুরু করা যায়নি। পরে আবার চেষ্টা করুন।' }, { status: 502 });
  }
}
