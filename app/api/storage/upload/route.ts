import { NextRequest, NextResponse } from 'next/server';

const STORAGE_SERVICE_URL = process.env.STORAGE_SERVICE_URL?.replace(/\/$/, '');

if (!STORAGE_SERVICE_URL) {
  throw new Error('STORAGE_SERVICE_URL environment variable is required for file uploads.');
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const type = formData.get('type');
  const file = formData.get('file');

  if (type !== 'image' && type !== 'pdf') {
    return NextResponse.json({ error: 'Upload type must be either image or pdf.' }, { status: 400 });
  }

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'A file must be provided for upload.' }, { status: 400 });
  }

  const upstreamFormData = new FormData();
  upstreamFormData.append('type', type);
  const fileName = typeof (file as File).name === 'string' ? (file as File).name : 'upload';
  upstreamFormData.append('file', file, fileName);

  try {
    const uploadResponse = await fetch(`${STORAGE_SERVICE_URL}/upload`, {
      method: 'POST',
      body: upstreamFormData,
    });

    const rawText = await uploadResponse.text();
    let payload: any;

    try {
      payload = JSON.parse(rawText);
    } catch (err) {
      payload = { raw: rawText };
    }

    if (!uploadResponse.ok) {
      const message = typeof payload === 'object' && payload !== null && 'error' in payload
        ? payload.error
        : 'Upload failed';
      return NextResponse.json({ error: message, details: payload }, { status: uploadResponse.status });
    }

    const dataNode = payload.data ?? payload;
    const storedNode = dataNode.stored ?? dataNode.storage ?? {};
    const linksNode = dataNode.links ?? {};

    const storageName = storedNode.storage_name
      ?? dataNode.storage_name
      ?? payload.storage_name
      ?? null;

    const relativeUrl =
      linksNode.image_url
      ?? linksNode.file_url
      ?? linksNode.download_url
      ?? null;

    const absolutize = (url: string | null) => {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      return `${STORAGE_SERVICE_URL}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const absoluteUrl = absolutize(relativeUrl);
    const hotlinkDownload = linksNode.hotlink_download_url ?? dataNode.hotlink_download_url ?? null;
    const refreshUrl = linksNode.refresh_token_url ?? dataNode.refresh_token_url ?? null;
    const downloadUrl = absolutize(linksNode.download_url ?? hotlinkDownload ?? null);
    const hotlinkUrl = absolutize(hotlinkDownload);
    const refreshTokenUrl = absolutize(refreshUrl);

    const normalized = {
      raw: payload,
      storage_name: storageName,
      type: storedNode.type ?? dataNode.type ?? type,
      relative_url: relativeUrl,
      url: absoluteUrl,
      download_url: downloadUrl,
      hotlink_download_url: hotlinkUrl,
      refresh_token_url: refreshTokenUrl,
      size: storedNode.size ?? null,
      uploaded_at: storedNode.uploaded_at ?? null,
    };

    return NextResponse.json({ data: normalized });
  } catch (error) {
    console.error('Error uploading file to storage service', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
