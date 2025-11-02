## PHP File Storage Service

Minimal raw PHP service that exposes upload and download endpoints for images (preview-only) and PDFs (downloadable with 5 minute hotlink tokens).

### Quick start

```bash
HOTLINK_SECRET=your-strong-secret php -c php.ini -S localhost:8000 index.php
```

The bundled `php.ini` raises the default PHP upload/post size limits to 32 MB. Adjust the values inside if you need larger files.

### Run with Docker

```bash
docker build -t php-storage .
docker run --rm -p 8000:8000 -e HOTLINK_SECRET=your-strong-secret php-storage
```

The service will be reachable at `http://localhost:8000`.

Generate a secret for development with:

```bash
openssl rand -hex 32
```

Use the generated value in place of `your-strong-secret`. Set the same environment variable in production so tokens remain valid across restarts.

### Configuration

Adjust `config.php` as needed:

-   `direct_file_access`: toggle whether `/files/{storage_name}` is available without a token.
-   `allowed_image_domains`: list of hostnames allowed to load images (matches `Origin` or `Referer`), e.g. `['preview.example.com']`.
-   `hotlink.secret_key`: secret used to sign hotlink tokens (required for production).
-   `hotlink.ttl_seconds`: token lifetime in seconds (default 300).
-   `base_url`: optional absolute base used when generating URLs in responses.

### API

-   `POST /upload` — multipart form request with fields: `type=image|pdf` and `file` payload.
-   `GET /images/{storage_name}` — serves stored image when requested from an allowed domain.
-   `GET /files/{storage_name}` — direct PDF download (only if `direct_file_access` is enabled).
-   `GET /files/{storage_name}/token` — returns a fresh hotlink download URL.
-   `GET /download/{token}` — downloads the PDF using a signed token (valid for 5 minutes).

Uploads are saved under `storage/images` or `storage/files`. Generated URLs return the `storage_name` needed for subsequent requests.

# Image upload response

{
"data": {
"stored": {
"type": "image",
"storage_name": "f363aebbd059bd7e4082165f453b4b01_whatsapp-image-2025-04-16-at-01-10-13.jpg",
"size": 350721,
"uploaded_at": "2025-11-02T18:00:16+00:00"
},
"links": {
"image_url": "/images/f363aebbd059bd7e4082165f453b4b01_whatsapp-image-2025-04-16-at-01-10-13.jpg"
},
"storage_name": null,
"type": "image",
"url": null
}
}

Access Image - http://localhost:8000/images/f363aebbd059bd7e4082165f453b4b01_whatsapp-image-2025-04-16-at-01-10-13.jpg
