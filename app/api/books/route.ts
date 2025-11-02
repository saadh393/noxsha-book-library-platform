import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeBook } from '@/lib/serializers';
import type { Book } from '@/lib/types';

type BookRow = RowDataPacket & Record<string, unknown>;

export async function GET() {
  try {
    const rows = await query<BookRow[]>('SELECT * FROM books ORDER BY created_at DESC');
    return NextResponse.json({ data: rows.map<Book>((row) => serializeBook(row)) });
  } catch (error) {
    console.error('Error fetching books', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();

  const {
    title,
    author,
    category,
    description,
    rating,
    is_bestseller,
    is_new,
    price,
    image_url,
    image_storage_name,
    pdf_storage_name,
    pdf_original_name,
    old_price,
  } = payload;

  if (!title || !author || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const id = randomUUID();

  try {
    await execute(
      `
      INSERT INTO books (
        id,
        title,
        author,
        category,
        description,
        rating,
        is_bestseller,
        is_new,
        price,
        image_url,
        image_storage_name,
        pdf_storage_name,
        pdf_original_name,
        old_price
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        title,
        author,
        category,
        description ?? '',
        rating ?? 0,
        is_bestseller ? 1 : 0,
        is_new ? 1 : 0,
        price ?? 0,
        image_url ?? null,
        image_storage_name ?? null,
        pdf_storage_name ?? null,
        pdf_original_name ?? null,
        old_price ?? null,
      ],
    );

    const rows = await query<BookRow[]>('SELECT * FROM books WHERE id = ?', [id]);
    return NextResponse.json({ data: serializeBook(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('Error inserting book', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
