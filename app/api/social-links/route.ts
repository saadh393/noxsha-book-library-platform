import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeSocialLink } from '@/lib/serializers';
import type { SocialLink } from '@/lib/types';

type SocialLinkRow = RowDataPacket & Record<string, unknown>;

export async function GET() {
  try {
    const rows = await query<SocialLinkRow[]>('SELECT * FROM social_links ORDER BY created_at');
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
    const id = randomUUID();
    await execute(
      `
      INSERT INTO social_links (id, platform, url, icon_name, is_active)
      VALUES (?, ?, ?, ?, 1)
    `,
      [id, platform, url, icon_name],
    );

    const rows = await query<SocialLinkRow[]>('SELECT * FROM social_links WHERE id = ?', [id]);
    return NextResponse.json({ data: serializeSocialLink(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('Error creating social link', error);
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 });
  }
}
