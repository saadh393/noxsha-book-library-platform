import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeBook } from '@/lib/serializers';
import type { Book, BookDocument, CategoryDocument } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getCollection<BookDocument>('books');
    const rows = await collection.find({}, { sort: { created_at: -1 } }).toArray();
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

  const normalizedCategory = typeof category === 'string' ? category.trim() : '';

  if (!title || !author || !normalizedCategory) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const id = randomUUID();

  try {
    const collection = await getCollection<BookDocument>('books');
    const categoriesCollection = await getCollection<CategoryDocument>('categories');
    const categoryExists = await categoriesCollection.findOne({ name: normalizedCategory });

    if (!categoryExists) {
      return NextResponse.json({ error: 'Selected category does not exist' }, { status: 400 });
    }

    const numericPrice = Number(price);
    const numericOldPrice = Number(old_price);
    const numericRating = Number(rating);
    const document: BookDocument = {
      _id: id,
      id,
      title,
      author,
      price: Number.isNaN(numericPrice) ? 0 : numericPrice,
      old_price:
        old_price === null || old_price === undefined || old_price === ''
          ? null
          : Number.isNaN(numericOldPrice)
            ? null
            : numericOldPrice,
      rating: Number.isNaN(numericRating) ? 0 : numericRating,
      sales_count: 0,
      description: typeof description === 'string' ? description : '',
      image_url: image_url ?? null,
      image_storage_name: image_storage_name ?? null,
      pdf_storage_name: pdf_storage_name ?? null,
      pdf_original_name: pdf_original_name ?? null,
      category: normalizedCategory,
      is_bestseller: Boolean(is_bestseller),
      is_new: Boolean(is_new),
      created_at: new Date(),
    };

    await collection.insertOne(document);

    return NextResponse.json({ data: serializeBook(document) }, { status: 201 });
  } catch (error) {
    console.error('Error inserting book', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
