import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth-server';
import { serializeSiteSetting } from '@/lib/serializers';
import type { SiteSetting, SiteSettingDocument } from '@/lib/types';
import { revalidateHomePages } from '@/lib/revalidate';

export async function GET(request: NextRequest) {
  const keysParam = request.nextUrl.searchParams.get('keys');
  const keys = keysParam ? keysParam.split(',').map((key) => key.trim()).filter(Boolean) : [];

  try {
    const collection = await getCollection<SiteSettingDocument>('site_settings');
    const filter = keys.length > 0 ? { key: { $in: keys } } : {};
    const rows = await collection
      .find(filter, { sort: { key: 1 }, projection: { _id: 0 } })
      .toArray();

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

  try {
    const collection = await getCollection<SiteSettingDocument>('site_settings');
    const updates = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { _id: key },
        update: {
          $set: {
            key,
            value: String(value),
            updated_at: new Date(),
          },
        },
        upsert: true,
      },
    }));

    await collection.bulkWrite(updates);
    revalidateHomePages();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating site settings', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
