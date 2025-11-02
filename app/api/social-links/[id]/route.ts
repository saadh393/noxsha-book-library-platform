import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';

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

  const fields: string[] = [];
  const values: Array<string | number> = [];

  if (payload.platform !== undefined) {
    fields.push('platform = ?');
    values.push(payload.platform);
  }

  if (payload.url !== undefined) {
    fields.push('url = ?');
    values.push(payload.url);
  }

  if (payload.icon_name !== undefined) {
    fields.push('icon_name = ?');
    values.push(payload.icon_name);
  }

  if (payload.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(payload.is_active ? 1 : 0);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    await execute(`UPDATE social_links SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating social link', error);
    return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 });
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
    await execute('DELETE FROM social_links WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social link', error);
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 });
  }
}
