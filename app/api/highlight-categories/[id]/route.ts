import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeHighlightCategory } from '@/lib/serializers';

type CategoryRow = RowDataPacket & Record<string, unknown>;

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
  const updates: string[] = [];
  const values: Array<string | number> = [];

  if (payload.name !== undefined) {
    updates.push('name = ?');
    values.push(payload.name);
  }
  if (payload.icon_name !== undefined) {
    updates.push('icon_name = ?');
    values.push(payload.icon_name);
  }
  if (payload.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(Number(payload.display_order) || 0);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    await execute(`UPDATE highlight_categories SET ${updates.join(', ')} WHERE id = ?`, [...values, id]);
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

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Highlight category not found' }, { status: 404 });
    }

    return NextResponse.json({ data: serializeHighlightCategory(rows[0]) });
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
    const result = await execute('DELETE FROM highlight_categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Highlight category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight category', error);
    return NextResponse.json({ error: 'Failed to delete highlight category' }, { status: 500 });
  }
}
