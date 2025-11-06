import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import type { SocialLinkDocument } from '@/lib/types';

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

  const updates: Partial<SocialLinkDocument> = {};

  if (payload.platform !== undefined) {
    updates.platform = payload.platform;
  }

  if (payload.url !== undefined) {
    updates.url = payload.url;
  }

  if (payload.icon_name !== undefined) {
    updates.icon_name = payload.icon_name;
  }

  if (payload.is_active !== undefined) {
    updates.is_active = Boolean(payload.is_active);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields provided' }, { status: 400 });
  }

  try {
    const collection = await getCollection<SocialLinkDocument>('social_links');
    const result = await collection.updateOne({ _id: id }, { $set: updates });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }

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
    const collection = await getCollection<SocialLinkDocument>('social_links');
    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting social link', error);
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 });
  }
}
