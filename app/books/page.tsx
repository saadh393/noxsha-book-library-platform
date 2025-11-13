import type { Metadata } from 'next';
import { cache } from 'react';
import BookListPageClient from '@/components/books/BookListPageClient';
import { getCollection } from '@/lib/db';
import { serializeBook } from '@/lib/serializers';
import type { Book, BookDocument, SiteSettingDocument } from '@/lib/types';
import { getFooterContent, getHeaderContent } from '@/lib/page-data.server';

type BookFilter = 'recommended' | 'recent' | 'bestseller' | 'popular';

const BOOK_LIMIT = 40;

const DEFAULT_TITLES: Record<BookFilter, string> = {
  recommended: 'আপনার জন্য প্রস্তাবিত',
  recent: 'সাম্প্রতিক সংযোজন',
  bestseller: 'বেস্টসেলার',
  popular: 'সবচেয়ে জনপ্রিয়',
};

const DEFAULT_SUBTITLES: Record<BookFilter, string> = {
  recommended: 'পাঠকদের রেটিং এবং পছন্দ অনুসারে সাজানো নির্বাচিত বইগুলো।',
  recent: 'নতুন সংযোজিত বইগুলো এক নজরে দেখে নিন।',
  bestseller: 'সবচেয়ে বেশি ডাউনলোড হওয়া ও আলোচিত বইয়ের তালিকা।',
  popular: 'বর্তমানে পাঠকদের সবচেয়ে বেশি আগ্রহের শীর্ষ বইগুলো।',
};

const SETTINGS_KEY_BY_FILTER: Record<BookFilter, string> = {
  recommended: 'home_section_recommended_title',
  recent: 'home_section_recent_title',
  bestseller: 'home_section_bestseller_title',
  popular: 'home_section_popular_title',
};

const VALID_FILTERS: BookFilter[] = ['recommended', 'recent', 'bestseller', 'popular'];

const fetchBooks = cache(async (filter: BookFilter): Promise<Book[]> => {
  const collection = await getCollection<BookDocument>('books');

  let documents: BookDocument[] = [];

  switch (filter) {
    case 'recommended':
      documents = await collection
        .find({})
        .sort({ rating: -1, sales_count: -1, created_at: -1 })
        .limit(BOOK_LIMIT)
        .toArray();
      break;
    case 'recent':
      documents = await collection
        .find({})
        .sort({ created_at: -1 })
        .limit(BOOK_LIMIT)
        .toArray();
      break;
    case 'bestseller':
      documents = await collection
        .find({ is_bestseller: true })
        .sort({ created_at: -1 })
        .limit(BOOK_LIMIT)
        .toArray();
      break;
    case 'popular':
      documents = await collection
        .find({})
        .sort({ sales_count: -1, rating: -1 })
        .limit(BOOK_LIMIT)
        .toArray();
      break;
    default:
      documents = await collection.find({}).limit(BOOK_LIMIT).toArray();
      break;
  }

  return documents.map((doc) => serializeBook(doc));
});

const getSectionTitle = cache(async (filter: BookFilter): Promise<string> => {
  try {
    const collection = await getCollection<SiteSettingDocument>('site_settings');
    const key = SETTINGS_KEY_BY_FILTER[filter];
    const record = await collection.findOne({ key });
    if (record?.value?.trim()) {
      return record.value.trim();
    }
  } catch (error) {
    console.error('Failed to load section title', error);
  }
  return DEFAULT_TITLES[filter];
});

function isBookFilter(value: string | undefined): value is BookFilter {
  return typeof value === 'string' && VALID_FILTERS.includes(value as BookFilter);
}

function mapSectionToFilter(section?: string): BookFilter | null {
  if (!section) return null;
  const normalized = section.toLowerCase();
  if (normalized.includes('popular') || normalized.includes('জনপ্রিয়')) {
    return 'popular';
  }
  if (normalized.includes('recent') || normalized.includes('সাম্প্রতিক')) {
    return 'recent';
  }
  if (normalized.includes('bestseller') || normalized.includes('বেস্টসেলার')) {
    return 'bestseller';
  }
  if (normalized.includes('প্রস্তাবিত') || normalized.includes('recommended')) {
    return 'recommended';
  }
  return null;
}

function resolveFilter(searchParams: Record<string, string | string[] | undefined>): BookFilter {
  const filterParam = Array.isArray(searchParams.filter)
    ? searchParams.filter[0]
    : searchParams.filter;

  if (isBookFilter(filterParam)) {
    return filterParam;
  }

  const sectionParam = Array.isArray(searchParams.section)
    ? searchParams.section[0]
    : searchParams.section;

  const mapped = mapSectionToFilter(sectionParam);
  if (mapped) return mapped;

  return 'recommended';
}

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const filter = resolveFilter(searchParams);
  const title = await getSectionTitle(filter);
  const pageTitle = `${title} | নোকশা ই-বুক`;
  const description = DEFAULT_SUBTITLES[filter];

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: `/books?filter=${filter}`,
    },
    openGraph: {
      title: pageTitle,
      description,
      type: 'website',
      url: `/books?filter=${filter}`,
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description,
    },
  };
}

export default async function BooksIndexPage({ searchParams }: PageProps) {
  const filter = resolveFilter(searchParams);
  const [books, title, headerContent, footerContent] = await Promise.all([
    fetchBooks(filter),
    getSectionTitle(filter),
    getHeaderContent(),
    getFooterContent(),
  ]);
  const subtitle = DEFAULT_SUBTITLES[filter];

  return (
    <BookListPageClient
      filter={filter}
      books={books}
      title={title}
      subtitle={subtitle}
      headerContent={headerContent}
      footerContent={footerContent}
    />
  );
}
