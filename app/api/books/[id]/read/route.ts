import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { createBookReadUrl } from '@/lib/storage-provider.server';
import type { BookDocument } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const collection = await getCollection<BookDocument>('books');
    const book = await collection.findOne(
      { _id: id },
      { projection: { pdf_storage_name: 1, pdf_original_name: 1 } },
    );

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (!book.pdf_storage_name) {
      return NextResponse.json({ error: 'PDF not available for this book' }, { status: 404 });
    }

    const readUrl = await createBookReadUrl(book.pdf_storage_name);
    return NextResponse.json({
      readUrl,
      fileName: book.pdf_original_name ?? null,
    });
  } catch (error) {
    console.error('Failed to generate PDF read link', error);
    const message = error instanceof Error ? error.message : 'Failed to generate read link';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
