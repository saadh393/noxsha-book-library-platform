import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import type { ReviewDocument } from '@/lib/types';

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
    const collection = await getCollection<ReviewDocument>('reviews');
    const result = await collection.updateOne({ _id: id }, { $set: { is_approved: isApproved } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

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
    const collection = await getCollection<ReviewDocument>('reviews');
    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
