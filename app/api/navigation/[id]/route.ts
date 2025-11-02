import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeNavLink } from '@/lib/serializers';

type NavRow = RowDataPacket & Record<string, unknown>;

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

  if (payload.label !== undefined) {
    updates.push('label = ?');
    values.push(payload.label);
  }
  if (payload.href !== undefined) {
    updates.push('href = ?');
    values.push(payload.href);
  }
  if (payload.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(Number(payload.display_order) || 0);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    await execute(`UPDATE nav_links SET ${updates.join(', ')} WHERE id = ?`, [...values, id]);
    const rows = await query<NavRow[]>('SELECT * FROM nav_links WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Navigation link not found' }, { status: 404 });
    }

    return NextResponse.json({ data: serializeNavLink(rows[0]) });
  } catch (error) {
    console.error('Error updating navigation link', error);
    return NextResponse.json({ error: 'Failed to update navigation link' }, { status: 500 });
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
    const result = await execute('DELETE FROM nav_links WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Navigation link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting navigation link', error);
    return NextResponse.json({ error: 'Failed to delete navigation link' }, { status: 500 });
  }
}
