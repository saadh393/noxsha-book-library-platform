import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { query } from '@/lib/db';
import { serializeBook } from '@/lib/serializers';
import type { Book } from '@/lib/types';

type BookRow = RowDataPacket & Record<string, unknown>;

export async function GET(request: NextRequest) {
  const searchQuery = request.nextUrl.searchParams.get('query')?.trim();

  if (!searchQuery) {
    return NextResponse.json({ data: [] });
  }

  try {
    const likeQuery = `%${searchQuery}%`;
    const rows = await query<BookRow[]>(
      `
      SELECT *
      FROM books
      WHERE title LIKE ? OR author LIKE ?
      ORDER BY rating DESC
    `,
      [likeQuery, likeQuery],
    );

    return NextResponse.json({ data: rows.map<Book>((row) => serializeBook(row)) });
  } catch (error) {
    console.error('Error searching books', error);
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 });
  }
}
