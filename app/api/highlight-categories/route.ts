import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeHighlightCategory } from '@/lib/serializers';
import type { HighlightCategory } from '@/lib/types';

type CategoryRow = RowDataPacket & Record<string, unknown>;

export async function GET() {
  try {
    const rows = await query<CategoryRow[]>(
      `
      SELECT hc.*, (
        SELECT COUNT(*) FROM books b WHERE b.category = hc.name
      ) AS book_count
      FROM highlight_categories hc
      ORDER BY hc.display_order ASC, hc.created_at ASC
    `,
    );

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
    await execute(
      `
      INSERT INTO highlight_categories (id, name, icon_name, display_order)
      VALUES (?, ?, ?, ?)
    `,
      [id, name, icon_name, Number.isFinite(display_order) ? Number(display_order) : 0],
    );

    const rows = await query<CategoryRow[]>(
      `
      SELECT hc.*, (
        SELECT COUNT(*) FROM books b WHERE b.category = hc.name
      ) AS book_count
      FROM highlight_categories hc
      WHERE hc.id = ?
    `,
      [id],
    );

    return NextResponse.json({ data: serializeHighlightCategory(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('Error creating highlight category', error);
    return NextResponse.json({ error: 'Failed to create highlight category' }, { status: 500 });
  }
}
