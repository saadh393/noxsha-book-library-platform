import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeBook } from '@/lib/serializers';
import type { Book, BookDocument, CategoryDocument } from '@/lib/types';
import { revalidateBookPages } from '@/lib/revalidate';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const collection = await getCollection<BookDocument>('books');
    const book = await collection.findOne({ _id: id });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const relatedRows = await collection
      .find({ category: book.category, _id: { $ne: id } }, { sort: { created_at: -1 }, limit: 5 })
      .toArray();

    return NextResponse.json({
      book: serializeBook(book),
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

  const updates: Partial<BookDocument> = {};

  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.author !== undefined) updates.author = payload.author;
  let pendingCategory: string | undefined;
  if (payload.category !== undefined) {
    const categoryValue = typeof payload.category === 'string' ? payload.category.trim() : '';
    if (!categoryValue) {
      return NextResponse.json({ error: 'Category cannot be empty' }, { status: 400 });
    }
    pendingCategory = categoryValue;
  }
  if (payload.description !== undefined) updates.description = payload.description ?? '';
  if (payload.price !== undefined) {
    const numericPrice = Number(payload.price);
    if (!Number.isNaN(numericPrice)) {
      updates.price = numericPrice;
    }
  }
  if (payload.old_price !== undefined) {
    if (payload.old_price === null || payload.old_price === '') {
      updates.old_price = null;
    } else {
      const numericOldPrice = Number(payload.old_price);
      if (!Number.isNaN(numericOldPrice)) {
        updates.old_price = numericOldPrice;
      }
    }
  }
  if (payload.rating !== undefined) {
    const numericRating = Number(payload.rating);
    if (!Number.isNaN(numericRating)) {
      updates.rating = numericRating;
    }
  }
  if (payload.is_bestseller !== undefined) updates.is_bestseller = Boolean(payload.is_bestseller);
  if (payload.is_new !== undefined) updates.is_new = Boolean(payload.is_new);
  if (payload.image_url !== undefined) updates.image_url = payload.image_url ?? null;
  if (payload.image_storage_name !== undefined) updates.image_storage_name = payload.image_storage_name ?? null;
  if (payload.pdf_storage_name !== undefined) updates.pdf_storage_name = payload.pdf_storage_name ?? null;
  if (payload.pdf_original_name !== undefined) updates.pdf_original_name = payload.pdf_original_name ?? null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    const collection = await getCollection<BookDocument>('books');
    if (pendingCategory) {
      const categoriesCollection = await getCollection<CategoryDocument>('categories');
      const categoryExists = await categoriesCollection.findOne({ name: pendingCategory });
      if (!categoryExists) {
        return NextResponse.json({ error: 'Selected category does not exist' }, { status: 400 });
      }
      updates.category = pendingCategory;
    }
    const result = await collection.updateOne({ _id: id }, { $set: updates });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const updated = await collection.findOne({ _id: id });

    if (!updated) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    revalidateBookPages(id);
    return NextResponse.json({ data: serializeBook(updated) });
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
    const collection = await getCollection<BookDocument>('books');
    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    revalidateBookPages(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
