import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeReview } from '@/lib/serializers';
import type { Review } from '@/lib/types';

type ReviewRow = RowDataPacket & Record<string, unknown>;

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filter = request.nextUrl.searchParams.get('filter');

  try {
    let sql = `
      SELECT r.*, b.title AS book_title
      FROM reviews r
      LEFT JOIN books b ON b.id = r.book_id
    `;
    const params: Array<string | number> = [];

    if (filter === 'approved') {
      sql += ' WHERE r.is_approved = 1';
    } else if (filter === 'pending') {
      sql += ' WHERE r.is_approved = 0';
    }

    sql += ' ORDER BY r.created_at DESC';

    const rows = await query<ReviewRow[]>(sql, params);

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
