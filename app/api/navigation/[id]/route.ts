import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeNavLink } from '@/lib/serializers';
import type { NavLinkDocument } from '@/lib/types';

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
  const updates: Partial<NavLinkDocument> = {};

  if (payload.label !== undefined) {
    updates.label = payload.label;
  }
  if (payload.href !== undefined) {
    updates.href = payload.href;
  }
  if (payload.display_order !== undefined) {
    updates.display_order = Number(payload.display_order) || 0;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    const collection = await getCollection<NavLinkDocument>('nav_links');
    const result = await collection.updateOne({ _id: id }, { $set: updates });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Navigation link not found' }, { status: 404 });
    }

    const updated = await collection.findOne({ _id: id });

    if (!updated) {
      return NextResponse.json({ error: 'Navigation link not found' }, { status: 404 });
    }

    return NextResponse.json({ data: serializeNavLink(updated) });
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
    const collection = await getCollection<NavLinkDocument>('nav_links');
    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Navigation link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting navigation link', error);
    return NextResponse.json({ error: 'Failed to delete navigation link' }, { status: 500 });
  }
}
