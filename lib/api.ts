import type {
    Book,
    HighlightCategory,
    HighlightService,
    NavLink,
    Review,
    SocialLink,
    Category,
    Download,
} from "./types";

async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const message =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload
                ? (payload as { error: string }).error
                : typeof payload === "string"
                ? payload
                : "Request failed";

        throw new Error(message || "Request failed");
    }

    return payload as T;
}

export async function fetchHomeBooks() {
    const response = await fetch("/api/books/home", { cache: "no-store" });
    return handleResponse<{
        recommended: Book[];
        recent: Book[];
        bestsellers: Book[];
        popular: Book[];
    }>(response);
}

export async function searchBooks(query: string) {
    const response = await fetch(
        `/api/books/search?query=${encodeURIComponent(query)}`,
        {
            cache: "no-store",
        }
    );
    return handleResponse<{ data: Book[] }>(response);
}

export async function fetchBookDetails(id: string) {
    const response = await fetch(`/api/books/${id}`, { cache: "no-store" });
    return handleResponse<{ book: Book; related: Book[] }>(response);
}

export async function createDownload(payload: {
    bookId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
}) {
    const response = await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function adminLogin(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });
    return handleResponse<{
        user: { id: string; email: string; name: string };
    }>(response);
}

export async function adminLogout() {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function getAdminSession() {
    const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });
    return handleResponse<{
        user: { id: string; email: string; name: string } | null;
    }>(response);
}

export async function fetchBooks() {
    const response = await fetch("/api/books", {
        credentials: "include",
        cache: "no-store",
    });
    return handleResponse<{ data: Book[] }>(response);
}

export async function createBook(payload: {
    title: string;
    author: string;
    category: string;
    description: string;
    rating: number;
    is_bestseller: boolean;
    is_new: boolean;
    price: number;
    image_url: string | null;
    image_storage_name: string | null;
    pdf_storage_name: string | null;
    pdf_original_name: string | null;
    old_price: number | null;
}) {
    const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    return handleResponse<{ data: Book }>(response);
}

export async function updateBook(
    id: string,
    payload: Partial<Omit<Book, "id" | "created_at">>
) {
    const response = await fetch(`/api/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: Book }>(response);
}

export async function deleteBook(id: string) {
    const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function fetchReviews(filter: "all" | "approved" | "pending") {
    const response = await fetch(`/api/reviews?filter=${filter}`, {
        credentials: "include",
        cache: "no-store",
    });
    return handleResponse<{
        data: Array<Review & { book_title: string | null }>;
    }>(response);
}

export async function updateReviewApproval(id: string, isApproved: boolean) {
    const response = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isApproved }),
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function deleteReview(id: string) {
    const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function fetchSiteSettings(keys: string[]) {
    const response = await fetch(`/api/settings?keys=${keys.join(",")}`, {
        credentials: "include",
        cache: "no-store",
    });
    return handleResponse<{ data: Record<string, string> }>(response);
}

export async function updateSiteSettings(settings: Record<string, string>) {
    const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ settings }),
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function fetchSocialLinks() {
    const response = await fetch("/api/social-links", {
        credentials: "include",
        cache: "no-store",
    });
    return handleResponse<{ data: SocialLink[] }>(response);
}

export async function createSocialLink(payload: {
    platform: string;
    url: string;
    icon_name: string;
}) {
    const response = await fetch("/api/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: SocialLink }>(response);
}

export async function updateSocialLink(
    id: string,
    payload: Partial<SocialLink>
) {
    const response = await fetch(`/api/social-links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function deleteSocialLink(id: string) {
    const response = await fetch(`/api/social-links/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function fetchActiveSocialLinks() {
    const response = await fetch("/api/social-links", {
        cache: "no-store",
    });
    return handleResponse<{ data: SocialLink[] }>(response);
}

interface UploadResponseData {
    storage_name: string | null;
    url: string | null;
    type: string;
    relative_url: string | null;
    download_url: string | null;
    hotlink_download_url: string | null;
    refresh_token_url: string | null;
    size: number | null;
    uploaded_at: string | null;
}

export async function uploadToStorage(file: File, type: "image" | "pdf") {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("file", file, file.name);

    const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    return handleResponse<{ data: UploadResponseData }>(response);
}

export async function requestBookDownload(bookId: string) {
    const response = await fetch(`/api/books/${bookId}/download`, {
        method: "GET",
        cache: "no-store",
    });
    return handleResponse<{ downloadUrl: string }>(response);
}

export async function fetchNavLinks() {
    const response = await fetch("/api/navigation", {
        cache: "no-store",
    });
    return handleResponse<{ data: NavLink[] }>(response);
}

export async function createNavLink(payload: {
    label: string;
    href: string;
    display_order: number;
}) {
    const response = await fetch("/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: NavLink }>(response);
}

export async function updateNavLink(id: string, payload: Partial<NavLink>) {
    const response = await fetch(`/api/navigation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: NavLink }>(response);
}

export async function deleteNavLink(id: string) {
    const response = await fetch(`/api/navigation/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function fetchHighlightCategories() {
    const response = await fetch("/api/highlight-categories", {
        cache: "no-store",
    });
    return handleResponse<{ data: HighlightCategory[] }>(response);
}

export async function createHighlightCategory(payload: {
    name: string;
    icon_name: string;
    display_order: number;
}) {
    const response = await fetch("/api/highlight-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: HighlightCategory }>(response);
}

export async function updateHighlightCategory(
    id: string,
    payload: Partial<HighlightCategory>
) {
    const response = await fetch(`/api/highlight-categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: HighlightCategory }>(response);
}

export async function deleteHighlightCategory(id: string) {
    const response = await fetch(`/api/highlight-categories/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function fetchHighlightServices() {
    const response = await fetch("/api/highlight-services", {
        cache: "no-store",
    });
    return handleResponse<{ data: HighlightService[] }>(response);
}

export async function createHighlightService(payload: {
    title: string;
    description: string;
    icon_name: string;
    display_order: number;
}) {
    const response = await fetch("/api/highlight-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: HighlightService }>(response);
}

export async function updateHighlightService(
    id: string,
    payload: Partial<HighlightService>
) {
    const response = await fetch(`/api/highlight-services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: HighlightService }>(response);
}

export async function deleteHighlightService(id: string) {
    const response = await fetch(`/api/highlight-services/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function fetchCategories() {
    const response = await fetch("/api/categories", {
        cache: "no-store",
        credentials: "include",
    });
    return handleResponse<{ data: Category[] }>(response);
}

export async function createCategory(payload: {
    name: string;
    icon_name: string;
    color: { h: number; s: number; l: number };
}) {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: Category }>(response);
}

export async function updateCategory(
    id: string,
    payload: Partial<{
        name: string;
        icon_name: string;
        color: { h: number; s: number; l: number };
    }>
) {
    const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleResponse<{ data: Category }>(response);
}

export async function deleteCategory(id: string) {
    const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    return handleResponse<{ success: boolean }>(response);
}

export async function fetchDownloads() {
    const response = await fetch("/api/downloads", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });
    return handleResponse<{ data: Download[] }>(response);
}
