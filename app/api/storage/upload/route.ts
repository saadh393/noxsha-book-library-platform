import { NextRequest, NextResponse } from 'next/server';
import { ensureStorageUploadAuthorized, uploadFileToStorage } from '@/lib/storage-provider.server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!ensureStorageUploadAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const type = formData.get('type');
  const file = formData.get('file');

  if (type !== 'image' && type !== 'pdf') {
    return NextResponse.json({ error: 'Upload type must be either image or pdf.' }, { status: 400 });
  }

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'A file must be provided for upload.' }, { status: 400 });
  }

  const fileName = typeof (file as File).name === 'string' ? (file as File).name : 'upload';

  try {
    const response = await uploadFileToStorage({ file, fileName, type });
    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Error uploading file to storage provider', error);
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
