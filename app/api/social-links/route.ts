import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeSocialLink } from '@/lib/serializers';
import type { SocialLink, SocialLinkDocument } from '@/lib/types';

export async function GET() {
  try {
    const collection = await getCollection<SocialLinkDocument>('social_links');
    const rows = await collection.find({}, { sort: { created_at: 1 } }).toArray();
    return NextResponse.json({ data: rows.map<SocialLink>((row) => serializeSocialLink(row)) });
  } catch (error) {
    console.error('Error fetching social links', error);
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const { platform, url, icon_name } = payload;

  if (!platform || !url || !icon_name) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    const collection = await getCollection<SocialLinkDocument>('social_links');
    const id = randomUUID();
    const document: SocialLinkDocument = {
      _id: id,
      id,
      platform,
      url,
      icon_name,
      is_active: true,
      created_at: new Date(),
    };

    await collection.insertOne(document);
    return NextResponse.json({ data: serializeSocialLink(document) }, { status: 201 });
  } catch (error) {
    console.error('Error creating social link', error);
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 });
  }
}
