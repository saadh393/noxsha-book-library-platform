import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeNavLink } from '@/lib/serializers';
import type { NavLink, NavLinkDocument } from '@/lib/types';
import { revalidateHomePages } from '@/lib/revalidate';

export async function GET() {
  try {
    const collection = await getCollection<NavLinkDocument>('nav_links');
    const rows = await collection.find({}, { sort: { display_order: 1, created_at: 1 } }).toArray();
    return NextResponse.json({ data: rows.map<NavLink>((row) => serializeNavLink(row)) });
  } catch (error) {
    console.error('Error fetching navigation links', error);
    return NextResponse.json({ error: 'Failed to fetch navigation links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const { label, href, display_order } = payload;

  if (!label || !href) {
    return NextResponse.json({ error: 'Label and href are required' }, { status: 400 });
  }

  const id = randomUUID();

  try {
    const collection = await getCollection<NavLinkDocument>('nav_links');
    const document: NavLinkDocument = {
      _id: id,
      id,
      label,
      href,
      display_order: Number.isFinite(display_order) ? Number(display_order) : 0,
      created_at: new Date(),
    };

    await collection.insertOne(document);
    revalidateHomePages();
    return NextResponse.json({ data: serializeNavLink(document) }, { status: 201 });
  } catch (error) {
    console.error('Error creating navigation link', error);
    return NextResponse.json({ error: 'Failed to create navigation link' }, { status: 500 });
  }
}
