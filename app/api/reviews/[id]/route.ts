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
  const body = await request.json();
  const isApproved = Boolean(body.isApproved);

  try {
    await execute('UPDATE reviews SET is_approved = ? WHERE id = ?', [isApproved ? 1 : 0, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating review', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
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
    await execute('DELETE FROM reviews WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
