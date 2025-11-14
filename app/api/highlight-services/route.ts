import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeHighlightService } from '@/lib/serializers';
import type {
  HighlightService,
  HighlightServiceDocument,
} from '@/lib/types';
import { revalidateHomePages } from '@/lib/revalidate';

export async function GET() {
  try {
    const collection = await getCollection<HighlightServiceDocument>('highlight_services');
    const rows = await collection
      .find({}, { sort: { display_order: 1, created_at: 1 } })
      .toArray();
    return NextResponse.json({ data: rows.map<HighlightService>((row) => serializeHighlightService(row)) });
  } catch (error) {
    console.error('Error fetching highlight services', error);
    return NextResponse.json({ error: 'Failed to fetch highlight services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const { title, description, icon_name, display_order } = payload;

  if (!title || !description || !icon_name) {
    return NextResponse.json({ error: 'Title, description and icon are required' }, { status: 400 });
  }

  const id = randomUUID();

  try {
    const collection = await getCollection<HighlightServiceDocument>('highlight_services');
    const document: HighlightServiceDocument = {
      _id: id,
      id,
      title,
      description,
      icon_name,
      display_order: Number.isFinite(display_order) ? Number(display_order) : 0,
      created_at: new Date(),
    };

    await collection.insertOne(document);
    revalidateHomePages();
    return NextResponse.json({ data: serializeHighlightService(document) }, { status: 201 });
  } catch (error) {
    console.error('Error creating highlight service', error);
    return NextResponse.json({ error: 'Failed to create highlight service' }, { status: 500 });
  }
}
