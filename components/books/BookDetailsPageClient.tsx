'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookDetailsContent from '@/components/books/BookDetailsContent';
import type { Book } from '@/lib/types';
import type { FooterContent, HeaderContent } from '@/lib/page-data';

interface BookDetailsPageClientProps {
  book: Book;
  related: Book[];
  headerContent: HeaderContent;
  footerContent: FooterContent;
}

export default function BookDetailsPageClient({
  book,
  related,
  headerContent,
  footerContent,
}: BookDetailsPageClientProps) {
  const router = useRouter();

  const handleSearch = useCallback(
    (query: string) => {
      const nextPath = query ? `/?search=${encodeURIComponent(query)}` : '/';
      router.push(nextPath);
    },
    [router],
  );

  return (
    <>
      <Header
        onSearch={handleSearch}
        onAdminClick={() => router.push('/admin/login')}
        logoText={headerContent.logoText}
        searchPlaceholder={headerContent.searchPlaceholder}
        adminTooltip={headerContent.adminTooltip}
        navItems={headerContent.navItems}
      />
      <main>
        <BookDetailsContent
          bookId={book.id}
          initialBook={book}
          initialRelated={related}
          onBack={() => router.push('/')}
          onBookClick={(id) => router.push(`/books/${id}`)}
        />
      </main>
      <Footer
        companyName={footerContent.companyName}
        description={footerContent.description}
        quickLinks={footerContent.quickLinks}
        contactLinks={footerContent.contactLinks}
        bottomText={footerContent.bottomText}
        socialLinks={footerContent.socialLinks}
      />
    </>
  );
}
