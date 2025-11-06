import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeHighlightService } from '@/lib/serializers';
import type { HighlightServiceDocument } from '@/lib/types';

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
  const updates: Partial<HighlightServiceDocument> = {};

  if (payload.title !== undefined) {
    updates.title = payload.title;
  }
  if (payload.description !== undefined) {
    updates.description = payload.description;
  }
  if (payload.icon_name !== undefined) {
    updates.icon_name = payload.icon_name;
  }
  if (payload.display_order !== undefined) {
    updates.display_order = Number(payload.display_order) || 0;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    const collection = await getCollection<HighlightServiceDocument>('highlight_services');
    const result = await collection.updateOne({ _id: id }, { $set: updates });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Highlight service not found' }, { status: 404 });
    }

    const updated = await collection.findOne({ _id: id });

    if (!updated) {
      return NextResponse.json({ error: 'Highlight service not found' }, { status: 404 });
    }

    return NextResponse.json({ data: serializeHighlightService(updated) });
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
    const collection = await getCollection<HighlightServiceDocument>('highlight_services');
    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Highlight service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight service', error);
    return NextResponse.json({ error: 'Failed to delete highlight service' }, { status: 500 });
  }
}
