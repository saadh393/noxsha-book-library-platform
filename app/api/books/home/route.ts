import { NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { query } from '@/lib/db';
import { serializeBook } from '@/lib/serializers';
import type { Book } from '@/lib/types';

type BookRow = RowDataPacket & Record<string, unknown>;

export async function GET() {
  try {
    const [recommendedRows, recentRows, bestsellingRows, popularRows] = await Promise.all([
      query<BookRow[]>('SELECT * FROM books ORDER BY rating DESC LIMIT 5'),
      query<BookRow[]>('SELECT * FROM books ORDER BY created_at DESC LIMIT 5'),
      query<BookRow[]>('SELECT * FROM books WHERE is_bestseller = 1 ORDER BY created_at DESC LIMIT 4'),
      query<BookRow[]>('SELECT * FROM books ORDER BY sales_count DESC LIMIT 4'),
    ]);

    const response = {
      recommended: recommendedRows.map<Book>((row) => serializeBook(row)),
      recent: recentRows.map<Book>((row) => serializeBook(row)),
      bestsellers: bestsellingRows.map<Book>((row) => serializeBook(row)),
      popular: popularRows.map<Book>((row) => serializeBook(row)),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching home books', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
