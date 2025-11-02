import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeBook } from '@/lib/serializers';
import type { Book } from '@/lib/types';

type BookRow = RowDataPacket & Record<string, unknown>;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const bookRows = await query<BookRow[]>('SELECT * FROM books WHERE id = ?', [id]);

    if (bookRows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const bookRow = bookRows[0];
    const relatedRows = await query<BookRow[]>(
      `
      SELECT *
      FROM books
      WHERE category = ? AND id <> ?
      ORDER BY created_at DESC
      LIMIT 5
    `,
      [bookRow.category, id],
    );

    return NextResponse.json({
      book: serializeBook(bookRow),
      related: relatedRows.map<Book>((row) => serializeBook(row)),
    });
  } catch (error) {
    console.error('Error fetching book', error);
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json();

  const allowedFields: Record<string, unknown> = {
    title: payload.title,
    author: payload.author,
    category: payload.category,
    description: payload.description,
    price: payload.price,
    old_price: payload.old_price,
    rating: payload.rating,
    is_bestseller: payload.is_bestseller,
    is_new: payload.is_new,
    image_url: payload.image_url,
    image_storage_name: payload.image_storage_name,
    pdf_storage_name: payload.pdf_storage_name,
    pdf_original_name: payload.pdf_original_name,
  };

  const updates: string[] = [];
  const values: Array<string | number | null> = [];

  for (const [field, value] of Object.entries(allowedFields)) {
    if (value === undefined) continue;

    if (field === 'is_bestseller' || field === 'is_new') {
      updates.push(`${field} = ?`);
      values.push(value ? 1 : 0);
      continue;
    }

    updates.push(`${field} = ?`);
    values.push(value as string | number | null);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    await execute(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`, [...values, id]);
    const rows = await query<BookRow[]>('SELECT * FROM books WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ data: serializeBook(rows[0]) });
  } catch (error) {
    console.error('Error updating book', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const result = await execute('DELETE FROM books WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
