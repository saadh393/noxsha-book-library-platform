import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeHighlightCategory } from '@/lib/serializers';
import type {
  BookDocument,
  HighlightCategoryDocument,
} from '@/lib/types';
import { revalidateHomePages } from '@/lib/revalidate';

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
  const updates: Partial<HighlightCategoryDocument> = {};

  if (payload.name !== undefined) {
    updates.name = payload.name;
  }
  if (payload.icon_name !== undefined) {
    updates.icon_name = payload.icon_name;
  }
  if (payload.display_order !== undefined) {
    updates.display_order = Number(payload.display_order) || 0;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    const categoriesCollection = await getCollection<HighlightCategoryDocument>('highlight_categories');
    const booksCollection = await getCollection<BookDocument>('books');

    const result = await categoriesCollection.updateOne({ _id: id }, { $set: updates });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Highlight category not found' }, { status: 404 });
    }

    const updated = await categoriesCollection.findOne({ _id: id });

    if (!updated) {
      return NextResponse.json({ error: 'Highlight category not found' }, { status: 404 });
    }

    const bookCount = await booksCollection.countDocuments({ category: updated.name });
    revalidateHomePages();
    return NextResponse.json({ data: serializeHighlightCategory({ ...updated, book_count: bookCount }) });
  } catch (error) {
    console.error('Error updating highlight category', error);
    return NextResponse.json({ error: 'Failed to update highlight category' }, { status: 500 });
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
    const categoriesCollection = await getCollection<HighlightCategoryDocument>('highlight_categories');
    const result = await categoriesCollection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Highlight category not found' }, { status: 404 });
    }

    revalidateHomePages();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight category', error);
    return NextResponse.json({ error: 'Failed to delete highlight category' }, { status: 500 });
  }
}
