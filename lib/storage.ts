import type { Book } from './types';

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/$/, '') ?? '';

interface ImageOptions {
  width?: number;
  height?: number;
}

const defaultPlaceholder = 'https://placehold.co/{width}x{height}?text=No+Image';

function buildPlaceholder({ width = 240, height = 360 }: ImageOptions = {}) {
  return defaultPlaceholder.replace('{width}', String(width)).replace('{height}', String(height));
}

export function buildStorageImageUrl(storageName: string | null) {
  if (!storageName) {
    return null;
  }

  if (storageName.startsWith('http')) {
    return storageName;
  }

  if (!STORAGE_BASE_URL) {
    return `/images/${storageName}`;
  }

  return `${STORAGE_BASE_URL}/images/${storageName}`;
}

export function getBookImageUrl(book: Book, options: ImageOptions = {}) {
  const directUrl = book.image_url?.length ? book.image_url : null;
  const storageUrl = buildStorageImageUrl(book.image_storage_name ?? null);

  return directUrl ?? storageUrl ?? buildPlaceholder(options);
}
