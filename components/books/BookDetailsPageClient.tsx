'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookDetailsContent from '@/components/books/BookDetailsContent';
import type { Book } from '@/lib/types';

interface BookDetailsPageClientProps {
  book: Book;
  related: Book[];
}

export default function BookDetailsPageClient({ book, related }: BookDetailsPageClientProps) {
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
      <Header onSearch={handleSearch} onAdminClick={() => router.push('/admin/login')} />
      <main>
        <BookDetailsContent
          bookId={book.id}
          initialBook={book}
          initialRelated={related}
          onBack={() => router.push('/')}
          onBookClick={(id) => router.push(`/books/${id}`)}
        />
      </main>
      <Footer />
    </>
  );
}
