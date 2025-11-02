import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { query } from '@/lib/db';

const STORAGE_SERVICE_URL = process.env.STORAGE_SERVICE_URL?.replace(/\/$/, '');

if (!STORAGE_SERVICE_URL) {
  throw new Error('STORAGE_SERVICE_URL environment variable is required to generate download links.');
}

type BookRow = RowDataPacket & {
  pdf_storage_name: string | null;
  pdf_original_name: string | null;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const rows = await query<BookRow[]>('SELECT pdf_storage_name, pdf_original_name FROM books WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const { pdf_storage_name } = rows[0];

    if (!pdf_storage_name) {
      return NextResponse.json({ error: 'PDF not available for this book' }, { status: 404 });
    }

    const tokenEndpoint = `${STORAGE_SERVICE_URL}/files/${pdf_storage_name}/token`;
    const storageResponse = await fetch(tokenEndpoint);

    if (!storageResponse.ok) {
      const message = await storageResponse.text();
      return NextResponse.json({ error: 'Failed to generate download link', details: message }, { status: 502 });
    }

    const payload = await storageResponse.json();
    const downloadUrl =
      payload.hotlink_download_url ??
      payload.download_url ??
      payload.links?.hotlink_download_url ??
      payload.links?.download_url ??
      null;

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Storage service did not return a download URL' }, { status: 502 });
    }

    const absoluteUrl = downloadUrl.startsWith('http')
      ? downloadUrl
      : `${STORAGE_SERVICE_URL}${downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`}`;

    return NextResponse.json({ downloadUrl: absoluteUrl });
  } catch (error) {
    console.error('Failed to generate PDF download link', error);
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
  }
}
