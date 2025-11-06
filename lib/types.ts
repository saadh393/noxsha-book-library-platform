export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  old_price: number | null;
  rating: number;
  sales_count: number;
  description: string;
  image_url: string | null;
  image_storage_name: string | null;
  pdf_storage_name: string | null;
  pdf_original_name: string | null;
  category: string;
  is_bestseller: boolean;
  is_new: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  book_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  description?: string | null;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name: string;
  is_active: boolean;
  created_at: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  display_order: number;
}

export interface HighlightCategory {
  id: string;
  name: string;
  icon_name: string;
  display_order: number;
  book_count: number;
}

export interface HighlightService {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
}

export interface Category {
  id: string;
  name: string;
  icon_name: string;
  color_h: number;
  color_s: number;
  color_l: number;
  created_at: string;
  updated_at: string;
  book_count?: number;
}

export interface Download {
  id: string;
  book_id: string;
  book_title: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface BookDocument {
  _id: string;
  id: string;
  title: string;
  author: string;
  price: number;
  old_price: number | null;
  rating: number;
  sales_count: number;
  description: string;
  image_url: string | null;
  image_storage_name: string | null;
  pdf_storage_name: string | null;
  pdf_original_name: string | null;
  category: string;
  is_bestseller: boolean;
  is_new: boolean;
  created_at: Date;
}

export interface ReviewDocument {
  _id: string;
  id: string;
  book_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: Date;
}

export interface SiteSettingDocument {
  _id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: Date;
}

export interface SocialLinkDocument {
  _id: string;
  id: string;
  platform: string;
  url: string;
  icon_name: string;
  is_active: boolean;
  created_at: Date;
}

export interface NavLinkDocument {
  _id: string;
  id: string;
  label: string;
  href: string;
  display_order: number;
  created_at: Date;
}

export interface HighlightCategoryDocument {
  _id: string;
  id: string;
  name: string;
  icon_name: string;
  display_order: number;
  created_at: Date;
}

export interface HighlightServiceDocument {
  _id: string;
  id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
  created_at: Date;
}

export interface CategoryDocument {
  _id: string;
  id: string;
  name: string;
  icon_name: string;
  color_h: number;
  color_s: number;
  color_l: number;
  created_at: Date;
  updated_at: Date;
}

export interface AdminUserDocument {
  _id: string;
  id: string;
  email: string;
  password_hash: string;
  name: string;
  is_active: boolean;
  created_at: Date;
}

export interface DownloadDocument {
  _id: string;
  id: string;
  book_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: Date;
}
