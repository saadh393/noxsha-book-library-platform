import { NextRequest, NextResponse } from 'next/server';
import { createImageKitDirectUploadConfig, ensureStorageUploadAuthorized } from '@/lib/storage-provider.server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!ensureStorageUploadAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body?.type;

    if (type !== 'image' && type !== 'pdf') {
      return NextResponse.json({ error: 'Upload type must be either image or pdf.' }, { status: 400 });
    }

    return NextResponse.json({ data: createImageKitDirectUploadConfig(type) });
  } catch (error) {
    console.error('Error creating upload authentication parameters', error);
    const message = error instanceof Error ? error.message : 'Failed to create upload authentication parameters';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
