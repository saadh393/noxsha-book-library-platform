import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { createBookReadUrl } from '@/lib/storage-provider.server';
import type { BookDocument } from '@/lib/types';

function sanitizeFileName(name: string | null | undefined) {
  const fallback = 'book.pdf';
  if (!name) {
    return fallback;
  }

  const normalized = name
    .replace(/[^\w.\- ]+/g, '_')
    .replace(/^\.+/, '')
    .replace(/\s+/g, '_')
    .trim();
  return normalized || fallback;
}

function buildContentDisposition(fileName: string) {
  const escapedAscii = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  const encodedUtf8 = encodeURIComponent(fileName)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
  return `inline; filename="${escapedAscii}"; filename*=UTF-8''${encodedUtf8}`;
}

export async function GET(
  request: NextRequest,
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
    const rangeHeader = request.headers.get('range');

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(readUrl, {
        cache: 'no-store',
        headers: rangeHeader ? { range: rangeHeader } : undefined,
      });
    } catch (error) {
      console.error('Failed to retrieve PDF from storage', error);
      return NextResponse.json({ error: 'Failed to retrieve PDF from storage' }, { status: 502 });
    }

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const upstreamMessage = await upstreamResponse.text().catch(() => '');
      return NextResponse.json(
        { error: upstreamMessage || 'Failed to load PDF preview' },
        { status: upstreamResponse.status || 500 },
      );
    }

    const fileName = sanitizeFileName(book.pdf_original_name);
    const headers = new Headers();
    headers.set('Content-Type', upstreamResponse.headers.get('content-type') || 'application/pdf');
    headers.set('Content-Disposition', buildContentDisposition(fileName));
    headers.set('Cache-Control', 'private, no-store, max-age=0');

    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    const contentRange = upstreamResponse.headers.get('content-range');
    if (contentRange) {
      headers.set('Content-Range', contentRange);
      headers.set('Accept-Ranges', 'bytes');
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  } catch (error) {
    console.error('Failed to stream PDF preview', error);
    const message = error instanceof Error ? error.message : 'Failed to stream PDF preview';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
