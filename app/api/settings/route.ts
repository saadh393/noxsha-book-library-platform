import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket } from 'mysql2/promise';
import { getConnection, query } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeSiteSetting } from '@/lib/serializers';
import type { SiteSetting } from '@/lib/types';

type SettingRow = RowDataPacket & Record<string, unknown>;

export async function GET(request: NextRequest) {
  const keysParam = request.nextUrl.searchParams.get('keys');
  const keys = keysParam ? keysParam.split(',').map((key) => key.trim()).filter(Boolean) : [];

  try {
    let sql = 'SELECT `key`, value, description FROM site_settings';
    const params: string[] = [];

    if (keys.length > 0) {
      sql += ` WHERE \`key\` IN (${keys.map(() => '?').join(',')})`;
      params.push(...keys);
    }

    const rows = await query<SettingRow[]>(`${sql} ORDER BY \`key\`` as string, params);
    const settings = rows.map<SiteSetting>((row) => serializeSiteSetting(row));

    const response = settings.reduce<Record<string, SiteSetting['value']>>((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Error fetching site settings', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const settings: Record<string, string> = payload.settings ?? {};

  if (!settings || Object.keys(settings).length === 0) {
    return NextResponse.json({ error: 'No settings provided' }, { status: 400 });
  }

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    for (const [key, value] of Object.entries(settings)) {
      await connection.execute(
        `
        UPDATE site_settings
        SET value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE \`key\` = ?
      `,
        [value, key],
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating site settings', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  } finally {
    connection.release();
  }
}
