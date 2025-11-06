import type {
  Book,
  HighlightCategory,
  HighlightService,
  NavLink,
  Review,
  SiteSetting,
  SocialLink,
  Category,
} from './types';

type PrimitiveRow = Record<string, any>;

function toIsoString(value: Date | string | null): string {
  if (!value) {
    return new Date().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

export function serializeBook(row: PrimitiveRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    price: Number(row.price),
    old_price: row.old_price !== null ? Number(row.old_price) : null,
    rating: Number(row.rating),
    sales_count: Number(row.sales_count),
    description: row.description ?? '',
    image_url: row.image_url ?? null,
    image_storage_name: row.image_storage_name ?? null,
    pdf_storage_name: row.pdf_storage_name ?? null,
    pdf_original_name: row.pdf_original_name ?? null,
    category: row.category,
    is_bestseller: Boolean(row.is_bestseller),
    is_new: Boolean(row.is_new),
    created_at: toIsoString(row.created_at),
  };
}

export function serializeReview(row: PrimitiveRow): Review {
  return {
    id: row.id,
    book_id: row.book_id,
    reviewer_name: row.reviewer_name,
    rating: Number(row.rating),
    comment: row.comment,
    is_approved: Boolean(row.is_approved),
    created_at: toIsoString(row.created_at),
  };
}

export function serializeSiteSetting(row: PrimitiveRow): SiteSetting {
  return {
    key: row.key,
    value: row.value,
    description: row.description ?? null,
  };
}

export function serializeSocialLink(row: PrimitiveRow): SocialLink {
  return {
    id: row.id,
    platform: row.platform,
    url: row.url,
    icon_name: row.icon_name,
    is_active: Boolean(row.is_active),
    created_at: toIsoString(row.created_at),
  };
}

export function serializeNavLink(row: PrimitiveRow): NavLink {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    display_order: Number(row.display_order ?? 0),
  };
}

export function serializeHighlightCategory(row: PrimitiveRow): HighlightCategory {
  return {
    id: row.id,
    name: row.name,
    icon_name: row.icon_name,
    display_order: Number(row.display_order ?? 0),
    book_count: Number(row.book_count ?? 0),
  };
}

export function serializeHighlightService(row: PrimitiveRow): HighlightService {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon_name: row.icon_name,
    display_order: Number(row.display_order ?? 0),
  };
}

export function serializeCategory(row: PrimitiveRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon_name: row.icon_name,
    color_h: Number(row.color_h ?? 0),
    color_s: Number(row.color_s ?? 0),
    color_l: Number(row.color_l ?? 0),
    created_at: toIsoString(row.created_at),
    updated_at: toIsoString(row.updated_at),
    book_count: row.book_count !== undefined ? Number(row.book_count) : undefined,
  };
}
