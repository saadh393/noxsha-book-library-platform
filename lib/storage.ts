import type { Book } from "./types";

export interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    fit?: "cover" | "contain";
    focus?:
        | "auto"
        | "center"
        | "top"
        | "left"
        | "right"
        | "bottom"
        | "top_left"
        | "top_right"
        | "bottom_left"
        | "bottom_right";
    format?: "auto" | "webp" | "avif" | "jpg" | "jpeg" | "png";
}

export const BOOK_IMAGE_VARIANTS = {
    admin: { width: 160, height: 224, quality: 76, fit: "cover", focus: "auto" },
    card: { width: 300, height: 400, quality: 78, fit: "cover", focus: "auto" },
    detail: { width: 900, height: 1200, quality: 88, fit: "contain" },
    og: { width: 1200, height: 630, quality: 84, fit: "cover", focus: "auto" },
    search: { width: 200, height: 300, quality: 74, fit: "cover", focus: "auto" },
    thumbnail: { width: 60, height: 80, quality: 72, fit: "cover", focus: "auto" },
} satisfies Record<string, ImageOptions>;

export const BRAND_IMAGE_VARIANTS = {
    header: { width: 160, height: 80, quality: 88, fit: "contain", format: "auto" },
    adminPreview: { width: 320, height: 160, quality: 88, fit: "contain", format: "auto" },
} satisfies Record<string, ImageOptions>;

const STORAGE_PROVIDER =
    process.env.NEXT_PUBLIC_STORAGE_PROVIDER?.trim().toLowerCase() ??
    process.env.STORAGE_PROVIDER?.trim().toLowerCase() ??
    "";

const STORAGE_BASE_URL =
    process.env.IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/$/, "") ??
    "";

const STORAGE_BASE_ORIGIN = getUrlOrigin(STORAGE_BASE_URL);

const defaultPlaceholder =
    "https://placehold.co/{width}x{height}?text=No+Image";

function buildPlaceholder({ width = 240, height = 360 }: ImageOptions = {}) {
    return defaultPlaceholder
        .replace("{width}", String(width))
        .replace("{height}", String(height));
}

function hasUrlScheme(value: string) {
    return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function getUrlOrigin(value: string) {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

function clampDimension(value: number | undefined) {
    if (!value || Number.isNaN(value) || value <= 0) {
        return null;
    }

    return Math.round(value);
}

function clampQuality(value: number | undefined) {
    if (!value || Number.isNaN(value)) {
        return null;
    }

    return Math.min(100, Math.max(1, Math.round(value)));
}

function canTransformWithImageKit(assetUrl: string) {
    if (STORAGE_PROVIDER !== "imagekit") {
        return false;
    }

    if (!assetUrl.startsWith("http")) {
        return true;
    }

    if (!STORAGE_BASE_ORIGIN) {
        return false;
    }

    return getUrlOrigin(assetUrl) === STORAGE_BASE_ORIGIN;
}

function buildImageKitTransformation(options: ImageOptions = {}) {
    const width = clampDimension(options.width);
    const height = clampDimension(options.height);
    const quality = clampQuality(options.quality);
    const transformations: string[] = [];

    if (width) {
        transformations.push(`w-${width}`);
    }

    if (height) {
        transformations.push(`h-${height}`);
    }

    if (width && height) {
        transformations.push(
            options.fit === "contain" ? "c-at_max" : "c-maintain_ratio",
        );

        if (options.fit !== "contain" && options.focus) {
            transformations.push(`fo-${options.focus}`);
        }
    }

    if (quality) {
        transformations.push(`q-${quality}`);
    }

    transformations.push(`f-${options.format ?? "auto"}`);

    return transformations.join(",");
}

function appendImageKitTransformation(assetUrl: string, options: ImageOptions) {
    if (!canTransformWithImageKit(assetUrl)) {
        return assetUrl;
    }

    const transformation = buildImageKitTransformation(options);

    if (!transformation) {
        return assetUrl;
    }

    const isAbsolute = assetUrl.startsWith("http");
    const workingUrl = new URL(
        assetUrl,
        STORAGE_BASE_URL || "https://storage.local",
    );

    if (workingUrl.searchParams.has("tr") || /\/tr:/.test(workingUrl.pathname)) {
        return assetUrl;
    }

    workingUrl.searchParams.set("tr", transformation);

    if (isAbsolute) {
        return workingUrl.toString();
    }

    const query = workingUrl.searchParams.toString();
    return query ? `${workingUrl.pathname}?${query}` : workingUrl.pathname;
}

export function inferStoredAssetPath(value: string | null | undefined) {
    if (!value || hasUrlScheme(value)) {
        return null;
    }

    return value.startsWith("/") ? value : `/${value}`;
}

export function buildStorageFileUrl(
    storageName: string | null,
    options: { legacyCollection?: "images" | "files" } = {},
) {
    if (!storageName) {
        return null;
    }

    if (hasUrlScheme(storageName)) {
        return storageName;
    }

    const normalizedPath = storageName.includes("/")
        ? storageName
        : options.legacyCollection
          ? `/${options.legacyCollection}/${storageName}`
          : `/${storageName}`;

    if (!STORAGE_BASE_URL) {
        return normalizedPath.startsWith("/")
            ? normalizedPath
            : `/${normalizedPath}`;
    }

    return `${STORAGE_BASE_URL}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

export function buildStorageImageUrl(
    storageName: string | null,
    options: ImageOptions = {},
) {
    const assetUrl = buildStorageFileUrl(storageName, {
        legacyCollection: "images",
    });

    if (!assetUrl) {
        return null;
    }

    return appendImageKitTransformation(assetUrl, options);
}

export function getBookImageUrl(book: Book, options: ImageOptions = {}) {
    const directUrl = book.image_url?.length
        ? buildStorageImageUrl(book.image_url, options)
        : null;
    const storageUrl = buildStorageImageUrl(
        book.image_storage_name ?? null,
        options,
    );

    return directUrl ?? storageUrl ?? buildPlaceholder(options);
}
