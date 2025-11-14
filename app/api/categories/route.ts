import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeCategory } from '@/lib/serializers';
import type { Category, CategoryDocument } from '@/lib/types';
import { revalidateHomePages } from '@/lib/revalidate';

const COLOR_LIGHT_MIN = 5;
const COLOR_LIGHT_MAX = 50;

function toNumber(value: unknown, fallback = 0) {
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

export async function GET() {
  try {
    const collection = await getCollection<CategoryDocument>('categories');
    const documents = await collection
      .aggregate<
        CategoryDocument & {
          book_stats?: Array<{ total: number }>;
          book_count?: number;
        }
      >([
        { $sort: { name: 1 } },
        {
          $lookup: {
            from: 'books',
            let: { categoryName: '$name' },
            pipeline: [
              { $match: { $expr: { $eq: ['$category', '$$categoryName'] } } },
              { $count: 'total' },
            ],
            as: 'book_stats',
          },
        },
        {
          $addFields: {
            book_count: {
              $ifNull: [{ $arrayElemAt: ['$book_stats.total', 0] }, 0],
            },
          },
        },
        { $project: { book_stats: 0 } },
      ])
      .toArray();
    return NextResponse.json({ data: documents.map<Category>((doc) => serializeCategory(doc)) });
  } catch (error) {
    console.error('Error fetching categories', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const rawName = typeof payload.name === 'string' ? payload.name.trim() : '';
  const iconName = typeof payload.icon_name === 'string' ? payload.icon_name.trim() : '';
  const colorPayload = payload.color ?? {};

  if (rawName.length < 2) {
    return NextResponse.json({ error: 'Category name must contain at least two characters' }, { status: 400 });
  }

  if (!iconName) {
    return NextResponse.json({ error: 'Icon name is required' }, { status: 400 });
  }

  const colorH = clamp(toNumber(colorPayload.h, 0), 0, 360);
  const colorS = clamp(toNumber(colorPayload.s, 60), 0, 100);
  const colorL = clamp(toNumber(colorPayload.l, 45), COLOR_LIGHT_MIN, COLOR_LIGHT_MAX);

  try {
    const collection = await getCollection<CategoryDocument>('categories');
    const existing = await collection.findOne({ name: rawName });

    if (existing) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 });
    }

    const id = randomUUID();
    const now = new Date();
    const document: CategoryDocument = {
      _id: id,
      id,
      name: rawName,
      icon_name: iconName,
      color_h: colorH,
      color_s: colorS,
      color_l: colorL,
      created_at: now,
      updated_at: now,
    };

    await collection.insertOne(document);
    revalidateHomePages();
    return NextResponse.json({ data: serializeCategory({ ...document, book_count: 0 }) }, { status: 201 });
  } catch (error) {
    console.error('Error creating category', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
