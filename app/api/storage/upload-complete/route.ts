import { NextRequest, NextResponse } from 'next/server';
import {
  buildStoredAssetUrl,
  createBookDownloadUrl,
  ensureStorageUploadAuthorized,
} from '@/lib/storage-provider.server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!ensureStorageUploadAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body?.type;
    const storageName = typeof body?.storage_name === 'string' ? body.storage_name : null;

    if (type !== 'image' && type !== 'pdf') {
      return NextResponse.json({ error: 'Upload type must be either image or pdf.' }, { status: 400 });
    }

    if (!storageName) {
      return NextResponse.json({ error: 'Uploaded file path is required.' }, { status: 400 });
    }

    const uploadedUrl = typeof body?.url === 'string' ? body.url : null;
    const downloadUrl = type === 'pdf' ? await createBookDownloadUrl(storageName) : null;
    const publicUrl = type === 'image' ? uploadedUrl ?? buildStoredAssetUrl(storageName, 'images') : null;

    return NextResponse.json({
      data: {
        provider: 'imagekit',
        storage_name: storageName,
        url: publicUrl,
        type,
        relative_url: storageName,
        download_url: downloadUrl,
        hotlink_download_url: downloadUrl,
        refresh_token_url: null,
        size: typeof body?.size === 'number' ? body.size : null,
        uploaded_at: typeof body?.uploaded_at === 'string' ? body.uploaded_at : null,
      },
    });
  } catch (error) {
    console.error('Error finalizing uploaded file', error);
    const message = error instanceof Error ? error.message : 'Failed to finalize uploaded file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
