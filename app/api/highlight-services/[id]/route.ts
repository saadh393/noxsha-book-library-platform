import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeHighlightService } from '@/lib/serializers';

type ServiceRow = RowDataPacket & Record<string, unknown>;

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

  if (payload.title !== undefined) {
    updates.push('title = ?');
    values.push(payload.title);
  }
  if (payload.description !== undefined) {
    updates.push('description = ?');
    values.push(payload.description);
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
    await execute(`UPDATE highlight_services SET ${updates.join(', ')} WHERE id = ?`, [...values, id]);
    const rows = await query<ServiceRow[]>('SELECT * FROM highlight_services WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Highlight service not found' }, { status: 404 });
    }

    return NextResponse.json({ data: serializeHighlightService(rows[0]) });
  } catch (error) {
    console.error('Error updating highlight service', error);
    return NextResponse.json({ error: 'Failed to update highlight service' }, { status: 500 });
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
    const result = await execute('DELETE FROM highlight_services WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Highlight service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight service', error);
    return NextResponse.json({ error: 'Failed to delete highlight service' }, { status: 500 });
  }
}
