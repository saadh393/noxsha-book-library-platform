const publicStorageBaseUrl =
  process.env.IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/$/, '') ||
  '';

const publicStorageProvider =
  process.env.STORAGE_PROVIDER?.trim().toLowerCase() ||
  (process.env.IMAGEKIT_URL_ENDPOINT ? 'imagekit' : '');

const remoteStoragePattern = publicStorageBaseUrl
  ? (() => {
      try {
        const url = new URL(publicStorageBaseUrl);
        return {
          protocol: url.protocol.replace(':', ''),
          hostname: url.hostname,
          port: url.port,
          pathname: '/**',
        };
      } catch {
        return null;
      }
    })()
  : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  env: {
    NEXT_PUBLIC_STORAGE_BASE_URL: publicStorageBaseUrl,
    NEXT_PUBLIC_STORAGE_PROVIDER: publicStorageProvider,
  },
  images: {
    remotePatterns: remoteStoragePattern ? [remoteStoragePattern] : [],
  },
};

export default nextConfig;
