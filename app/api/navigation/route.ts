import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeNavLink } from '@/lib/serializers';
import type { NavLink } from '@/lib/types';

type NavRow = RowDataPacket & Record<string, unknown>;

export async function GET() {
  try {
    const rows = await query<NavRow[]>('SELECT * FROM nav_links ORDER BY display_order ASC, created_at ASC');
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
    await execute(
      `
      INSERT INTO nav_links (id, label, href, display_order)
      VALUES (?, ?, ?, ?)
    `,
      [id, label, href, Number.isFinite(display_order) ? Number(display_order) : 0],
    );

    const rows = await query<NavRow[]>('SELECT * FROM nav_links WHERE id = ?', [id]);
    return NextResponse.json({ data: serializeNavLink(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('Error creating navigation link', error);
    return NextResponse.json({ error: 'Failed to create navigation link' }, { status: 500 });
  }
}
