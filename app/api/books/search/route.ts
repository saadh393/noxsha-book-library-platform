import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { serializeBook } from '@/lib/serializers';
import type { Book, BookDocument } from '@/lib/types';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  const searchQuery = request.nextUrl.searchParams.get('query')?.trim();

  if (!searchQuery) {
    return NextResponse.json({ data: [] });
  }

  try {
    const collection = await getCollection<BookDocument>('books');
    const regex = new RegExp(escapeRegExp(searchQuery), 'i');
    const rows = await collection
      .find(
        {
          $or: [{ title: { $regex: regex } }, { author: { $regex: regex } }],
        },
        { sort: { rating: -1 } },
      )
      .toArray();

    return NextResponse.json({ data: rows.map<Book>((row) => serializeBook(row)) });
  } catch (error) {
    console.error('Error searching books', error);
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 });
  }
}
