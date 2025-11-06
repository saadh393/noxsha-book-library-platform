import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeHighlightCategory } from '@/lib/serializers';
import type {
  BookDocument,
  HighlightCategory,
  HighlightCategoryDocument,
} from '@/lib/types';

export async function GET() {
  try {
    const categoriesCollection = await getCollection<HighlightCategoryDocument>('highlight_categories');
    const booksCollection = await getCollection<BookDocument>('books');

    const categories = await categoriesCollection
      .find({}, { sort: { display_order: 1, created_at: 1 } })
      .toArray();
    const categoryNames = categories.map((category) => category.name);

    const counts = categoryNames.length
      ? await booksCollection
          .aggregate<{ _id: string; count: number }>([
            { $match: { category: { $in: categoryNames } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
          ])
          .toArray()
      : [];

    const countMap = new Map<string, number>(counts.map((entry) => [entry._id, entry.count]));
    const rows = categories.map((category) => ({
      ...category,
      book_count: countMap.get(category.name) ?? 0,
    }));

    return NextResponse.json({ data: rows.map<HighlightCategory>((row) => serializeHighlightCategory(row)) });
  } catch (error) {
    console.error('Error fetching highlight categories', error);
    return NextResponse.json({ error: 'Failed to fetch highlight categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const { name, icon_name, display_order } = payload;

  if (!name || !icon_name) {
    return NextResponse.json({ error: 'Name and icon are required' }, { status: 400 });
  }

  const id = randomUUID();

  try {
    const categoriesCollection = await getCollection<HighlightCategoryDocument>('highlight_categories');
    const booksCollection = await getCollection<BookDocument>('books');

    const document: HighlightCategoryDocument = {
      _id: id,
      id,
      name,
      icon_name,
      display_order: Number.isFinite(display_order) ? Number(display_order) : 0,
      created_at: new Date(),
    };

    await categoriesCollection.insertOne(document);

    const bookCount = await booksCollection.countDocuments({ category: name });
    return NextResponse.json(
      { data: serializeHighlightCategory({ ...document, book_count: bookCount }) },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating highlight category', error);
    return NextResponse.json({ error: 'Failed to create highlight category' }, { status: 500 });
  }
}
