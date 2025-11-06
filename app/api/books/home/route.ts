import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { serializeBook } from '@/lib/serializers';
import type { Book, BookDocument } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getCollection<BookDocument>('books');
    const [recommendedRows, recentRows, bestsellingRows, popularRows] = await Promise.all([
      collection.find({}, { sort: { rating: -1 }, limit: 5 }).toArray(),
      collection.find({}, { sort: { created_at: -1 }, limit: 5 }).toArray(),
      collection.find({ is_bestseller: true }, { sort: { created_at: -1 }, limit: 4 }).toArray(),
      collection.find({}, { sort: { sales_count: -1 }, limit: 4 }).toArray(),
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
