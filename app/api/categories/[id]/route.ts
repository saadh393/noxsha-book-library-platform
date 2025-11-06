import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeCategory } from '@/lib/serializers';
import type { CategoryDocument, BookDocument } from '@/lib/types';

const COLOR_LIGHT_MIN = 5;
const COLOR_LIGHT_MAX = 50;

function toNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

  try {
    const collection = await getCollection<CategoryDocument>('categories');
    const existing = await collection.findOne({ _id: id });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updates: Partial<CategoryDocument> = {};
    let nameChanged = false;

    if (payload.name !== undefined) {
      const trimmed = typeof payload.name === 'string' ? payload.name.trim() : '';
      if (trimmed.length < 2) {
        return NextResponse.json({ error: 'Category name must contain at least two characters' }, { status: 400 });
      }

      if (trimmed !== existing.name) {
        const duplicate = await collection.findOne({ name: trimmed });
        if (duplicate) {
          return NextResponse.json({ error: 'Another category with this name already exists' }, { status: 409 });
        }

        updates.name = trimmed;
        nameChanged = true;
      }
    }

    if (payload.icon_name !== undefined) {
      const iconName = typeof payload.icon_name === 'string' ? payload.icon_name.trim() : '';
      if (!iconName) {
        return NextResponse.json({ error: 'Icon name cannot be empty' }, { status: 400 });
      }
      updates.icon_name = iconName;
    }

    if (payload.color !== undefined && payload.color !== null) {
      const colorPayload = payload.color;
      const h = clamp(toNumber(colorPayload.h, existing.color_h), 0, 360);
      const s = clamp(toNumber(colorPayload.s, existing.color_s), 0, 100);
      const l = clamp(toNumber(colorPayload.l, existing.color_l), COLOR_LIGHT_MIN, COLOR_LIGHT_MAX);
      updates.color_h = h;
      updates.color_s = s;
      updates.color_l = l;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.updated_at = new Date();

    await collection.updateOne({ _id: id }, { $set: updates });

    if (nameChanged && updates.name) {
      const booksCollection = await getCollection<BookDocument>('books');
      await booksCollection.updateMany({ category: existing.name }, { $set: { category: updates.name } });
    }

    const updated = await collection.findOne({ _id: id });
    if (!updated) {
      return NextResponse.json({ error: 'Category not found after update' }, { status: 404 });
    }

    const booksCollection = await getCollection<BookDocument>('books');
    const bookCount = await booksCollection.countDocuments({ category: updated.name });

    return NextResponse.json({ data: serializeCategory({ ...updated, book_count: bookCount }) });
  } catch (error) {
    console.error('Error updating category', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
    const collection = await getCollection<CategoryDocument>('categories');
    const category = await collection.findOne({ _id: id });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const booksCollection = await getCollection<BookDocument>('books');
    const bookUsageCount = await booksCollection.countDocuments({ category: category.name });

    if (bookUsageCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category while books are assigned to it', usage: bookUsageCount },
        { status: 409 },
      );
    }

    await collection.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
