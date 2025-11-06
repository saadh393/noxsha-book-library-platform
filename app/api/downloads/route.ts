import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import type { DownloadDocument } from '@/lib/types';

export async function POST(request: NextRequest) {
  const { bookId, name, email, phone, address } = await request.json();

  if (!bookId || !name || !email || !phone || !address) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    const collection = await getCollection<DownloadDocument>('downloads');
    const id = randomUUID();

    await collection.insertOne({
      _id: id,
      id,
      book_id: bookId,
      name,
      email,
      phone,
      address,
      created_at: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving download request', error);
    return NextResponse.json({ error: 'Failed to save download' }, { status: 500 });
  }
}
