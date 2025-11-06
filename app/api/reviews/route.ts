import { NextRequest, NextResponse } from 'next/server';
import type { Document } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeReview } from '@/lib/serializers';
import type { Review, ReviewDocument } from '@/lib/types';

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filter = request.nextUrl.searchParams.get('filter');

  try {
    const collection = await getCollection<ReviewDocument>('reviews');
    const pipeline: Document[] = [];

    if (filter === 'approved') {
      pipeline.push({ $match: { is_approved: true } });
    } else if (filter === 'pending') {
      pipeline.push({ $match: { is_approved: false } });
    }

    pipeline.push(
      { $sort: { created_at: -1 } },
      {
        $lookup: {
          from: 'books',
          localField: 'book_id',
          foreignField: 'id',
          as: 'book_docs',
        },
      },
      {
        $addFields: {
          book_title: {
            $cond: [
              { $gt: [{ $size: '$book_docs' }, 0] },
              { $arrayElemAt: ['$book_docs.title', 0] },
              null,
            ],
          },
        },
      },
      { $project: { book_docs: 0 } },
    );

    const rows = await collection.aggregate<(ReviewDocument & { book_title?: string | null })>(pipeline).toArray();

    return NextResponse.json({
      data: rows.map((row) => ({
        ...serializeReview(row),
        book_title: row.book_title ?? null,
      })),
    });
  } catch (error) {
    console.error('Error fetching reviews', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
