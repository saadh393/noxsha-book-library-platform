import ImageKit from '@imagekit/nodejs';
import { getSessionFromRequest } from '@/lib/auth-server';
import { buildStorageFileUrl } from '@/lib/storage';
import type { NextRequest } from 'next/server';

export type StorageUploadType = 'image' | 'pdf';

export interface StorageUploadResult {
  raw: unknown;
  provider: string;
  storage_name: string | null;
  type: string;
  relative_url: string | null;
  url: string | null;
  download_url: string | null;
  hotlink_download_url: string | null;
  refresh_token_url: string | null;
  size: number | null;
  uploaded_at: string | null;
}

interface StorageProviderUploadInput {
  file: Blob;
  fileName: string;
  type: StorageUploadType;
}

interface StorageProvider {
  readonly name: string;
  upload(input: StorageProviderUploadInput): Promise<StorageUploadResult>;
  createFileUrl(
    storageName: string,
    options?: {
      download?: boolean;
    },
  ): Promise<string>;
}

const DEFAULT_STORAGE_PROVIDER = 'imagekit';
const IMAGEKIT_SIGNED_FILE_TTL_SECONDS = 60 * 60 * 4;
const IMAGEKIT_IMAGE_FOLDER = '/books/images';
const IMAGEKIT_PDF_FOLDER = '/books/pdfs';

function normalizeStorageServiceUrl(value: string | undefined, variableName: string) {
  const normalized = value?.trim().replace(/\/$/, '');

  if (!normalized) {
    throw new Error(`${variableName} environment variable is required for the configured storage provider.`);
  }

  return normalized;
}

function normalizeImageKitFolder(folder: string | undefined, fallback: string) {
  const candidate = folder?.trim() || fallback;
  const withoutTrailingSlash = candidate.replace(/\/+$/, '');
  return withoutTrailingSlash.startsWith('/') ? withoutTrailingSlash : `/${withoutTrailingSlash}`;
}

function sanitizeUploadFileName(fileName: string) {
  const trimmed = fileName.trim();
  const fallbackName = trimmed || 'upload';

  return fallbackName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function normalizeStorageProviderName() {
  const explicitProvider = process.env.STORAGE_PROVIDER?.trim().toLowerCase();

  if (explicitProvider) {
    return explicitProvider;
  }

  if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
    return DEFAULT_STORAGE_PROVIDER;
  }

  if (process.env.STORAGE_SERVICE_URL) {
    return 'http-service';
  }

  throw new Error(
    'Storage provider is not configured. Set STORAGE_PROVIDER or the required provider environment variables.',
  );
}

function normalizeStorageName(storageName: string) {
  if (storageName.startsWith('http://') || storageName.startsWith('https://')) {
    return storageName;
  }

  return storageName.startsWith('/') ? storageName : `/${storageName}`;
}

function extractLegacyUploadErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }

  return fallback;
}

class HttpServiceStorageProvider implements StorageProvider {
  readonly name = 'http-service';
  private readonly serviceUrl = normalizeStorageServiceUrl(process.env.STORAGE_SERVICE_URL, 'STORAGE_SERVICE_URL');

  async upload(input: StorageProviderUploadInput) {
    const upstreamFormData = new FormData();
    upstreamFormData.append('type', input.type);
    upstreamFormData.append('file', input.file, input.fileName);

    const uploadResponse = await fetch(`${this.serviceUrl}/upload`, {
      method: 'POST',
      body: upstreamFormData,
    });

    const rawText = await uploadResponse.text();
    let payload: unknown;

    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = { raw: rawText };
    }

    if (!uploadResponse.ok) {
      throw new Error(extractLegacyUploadErrorMessage(payload, 'Upload failed'));
    }

    const dataNode = typeof payload === 'object' && payload !== null && 'data' in payload ? payload.data : payload;
    const normalizedData = typeof dataNode === 'object' && dataNode !== null ? dataNode as Record<string, any> : {};
    const storedNode = normalizedData.stored ?? normalizedData.storage ?? {};
    const linksNode = normalizedData.links ?? {};

    const storageName = storedNode.storage_name
      ?? normalizedData.storage_name
      ?? null;

    const relativeUrl =
      linksNode.image_url
      ?? linksNode.file_url
      ?? linksNode.download_url
      ?? null;

    const absolutize = (url: string | null) => {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      return `${this.serviceUrl}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const hotlinkDownload = linksNode.hotlink_download_url ?? normalizedData.hotlink_download_url ?? null;
    const refreshUrl = linksNode.refresh_token_url ?? normalizedData.refresh_token_url ?? null;
    const downloadUrl = absolutize(linksNode.download_url ?? hotlinkDownload ?? null);
    const hotlinkUrl = absolutize(hotlinkDownload);
    const refreshTokenUrl = absolutize(refreshUrl);

    return {
      raw: payload,
      provider: this.name,
      storage_name: storageName,
      type: storedNode.type ?? normalizedData.type ?? input.type,
      relative_url: relativeUrl,
      url: absolutize(relativeUrl),
      download_url: downloadUrl,
      hotlink_download_url: hotlinkUrl,
      refresh_token_url: refreshTokenUrl,
      size: storedNode.size ?? null,
      uploaded_at: storedNode.uploaded_at ?? null,
    } satisfies StorageUploadResult;
  }

  async createFileUrl(
    storageName: string,
    options: {
      download?: boolean;
    } = {},
  ) {
    if (!options.download) {
      return buildStorageFileUrl(storageName, { legacyCollection: 'files' }) ?? normalizeStorageName(storageName);
    }

    const tokenEndpoint = `${this.serviceUrl}/files/${storageName}/token`;
    const storageResponse = await fetch(tokenEndpoint);

    if (!storageResponse.ok) {
      const message = await storageResponse.text();
      throw new Error(message || 'Failed to generate download link');
    }

    const payload = await storageResponse.json();
    const downloadUrl =
      payload.hotlink_download_url
      ?? payload.download_url
      ?? payload.links?.hotlink_download_url
      ?? payload.links?.download_url
      ?? null;

    if (!downloadUrl) {
      throw new Error('Storage service did not return a download URL');
    }

    return downloadUrl.startsWith('http')
      ? downloadUrl
      : `${this.serviceUrl}${downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`}`;
  }
}

class ImageKitStorageProvider implements StorageProvider {
  readonly name = 'imagekit';
  private readonly urlEndpoint = normalizeStorageServiceUrl(
    process.env.IMAGEKIT_URL_ENDPOINT ?? process.env.NEXT_PUBLIC_STORAGE_BASE_URL,
    'IMAGEKIT_URL_ENDPOINT',
  );
  private readonly client = new ImageKit({
    privateKey: normalizeStorageServiceUrl(process.env.IMAGEKIT_PRIVATE_KEY, 'IMAGEKIT_PRIVATE_KEY'),
  });
  private readonly imageFolder = normalizeImageKitFolder(process.env.IMAGEKIT_IMAGE_FOLDER, IMAGEKIT_IMAGE_FOLDER);
  private readonly pdfFolder = normalizeImageKitFolder(process.env.IMAGEKIT_PDF_FOLDER, IMAGEKIT_PDF_FOLDER);

  async upload(input: StorageProviderUploadInput) {
    const uploadResponse = await this.client.files.upload({
      file: input.file,
      fileName: sanitizeUploadFileName(input.fileName),
      folder: input.type === 'image' ? this.imageFolder : this.pdfFolder,
      useUniqueFileName: true,
      isPrivateFile: input.type === 'pdf',
      responseFields: ['isPrivateFile'],
    });

    const storageName = uploadResponse.filePath ?? null;
    const publicUrl = storageName ? this.buildAssetUrl(storageName) : uploadResponse.url ?? null;
    const downloadUrl = storageName
      ? await this.createFileUrl(storageName, { download: true })
      : null;

    return {
      raw: uploadResponse,
      provider: this.name,
      storage_name: storageName,
      type: input.type,
      relative_url: storageName,
      url: input.type === 'image' ? publicUrl : null,
      download_url: downloadUrl,
      hotlink_download_url: downloadUrl,
      refresh_token_url: null,
      size: uploadResponse.size ?? null,
      uploaded_at: null,
    } satisfies StorageUploadResult;
  }

  async createFileUrl(
    storageName: string,
    options: {
      download?: boolean;
    } = {},
  ) {
    return this.buildAssetUrl(storageName, {
      asAttachment: options.download,
      expiresInSeconds: IMAGEKIT_SIGNED_FILE_TTL_SECONDS,
      signed: true,
    });
  }

  private buildAssetUrl(
    storageName: string,
    options: {
      asAttachment?: boolean;
      expiresInSeconds?: number;
      signed?: boolean;
    } = {},
  ) {
    return this.client.helper.buildSrc({
      urlEndpoint: this.urlEndpoint,
      src: normalizeStorageName(storageName),
      signed: options.signed,
      expiresIn: options.expiresInSeconds,
      queryParameters: options.asAttachment ? { 'ik-attachment': 'true' } : undefined,
    });
  }
}

function createStorageProvider() {
  const providerName = normalizeStorageProviderName();

  switch (providerName) {
    case 'imagekit':
      return new ImageKitStorageProvider();
    case 'http-service':
    case 'storage-service':
    case 'legacy':
      return new HttpServiceStorageProvider();
    default:
      throw new Error(`Unsupported storage provider "${providerName}".`);
  }
}

const storageProvider = createStorageProvider();

export function ensureStorageUploadAuthorized(request: NextRequest) {
  return Boolean(getSessionFromRequest(request));
}

export async function uploadFileToStorage(input: StorageProviderUploadInput) {
  return storageProvider.upload(input);
}

export async function createBookDownloadUrl(storageName: string) {
  return storageProvider.createFileUrl(storageName, { download: true });
}

export async function createBookReadUrl(storageName: string) {
  return storageProvider.createFileUrl(storageName, { download: false });
}

export function buildStoredAssetUrl(storageName: string | null, legacyCollection?: 'images' | 'files') {
  return buildStorageFileUrl(storageName, { legacyCollection });
}
