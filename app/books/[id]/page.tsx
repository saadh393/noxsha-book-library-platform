'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookDetailsContent from '@/components/books/BookDetailsContent';

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const bookId = useMemo(() => params?.id ?? '', [params]);

  const handleSearch = (query: string) => {
    const nextPath = query ? `/?search=${encodeURIComponent(query)}` : '/';
    router.push(nextPath);
  };

  if (!bookId) {
    return null;
  }

  return (
    <>
      <Header onSearch={handleSearch} onAdminClick={() => router.push('/admin/login')} />
      <main>
        <BookDetailsContent
          bookId={bookId}
          onBack={() => router.push('/')}
          onBookClick={(id) => router.push(`/books/${id}`)}
        />
      </main>
      <Footer />
    </>
  );
}
