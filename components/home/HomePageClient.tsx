'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeContent from '@/components/home/HomeContent';

export default function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamValue = searchParams.get('search') ?? '';
  const [searchQuery, setSearchQuery] = useState(searchParamValue);

  useEffect(() => {
    setSearchQuery(searchParamValue);
  }, [searchParamValue]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const nextPath = query ? `/?search=${encodeURIComponent(query)}` : '/';
    router.replace(nextPath, { scroll: false });
  };

  const handleBookClick = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  const handleAdminNavigate = () => {
    router.push('/admin/login');
  };

  return (
    <>
      <Header
        initialSearchQuery={searchQuery}
        onSearch={handleSearch}
        onAdminClick={handleAdminNavigate}
      />
      <main>
        <HomeContent onBookClick={handleBookClick} searchQuery={searchQuery} />
      </main>
      <Footer />
    </>
  );
}
