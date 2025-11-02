import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeHighlightService } from '@/lib/serializers';
import type { HighlightService } from '@/lib/types';

type ServiceRow = RowDataPacket & Record<string, unknown>;

export async function GET() {
  try {
    const rows = await query<ServiceRow[]>(
      'SELECT * FROM highlight_services ORDER BY display_order ASC, created_at ASC',
    );
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
    await execute(
      `
      INSERT INTO highlight_services (id, title, description, icon_name, display_order)
      VALUES (?, ?, ?, ?, ?)
    `,
      [id, title, description, icon_name, Number.isFinite(display_order) ? Number(display_order) : 0],
    );

    const rows = await query<ServiceRow[]>('SELECT * FROM highlight_services WHERE id = ?', [id]);
    return NextResponse.json({ data: serializeHighlightService(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('Error creating highlight service', error);
    return NextResponse.json({ error: 'Failed to create highlight service' }, { status: 500 });
  }
}
