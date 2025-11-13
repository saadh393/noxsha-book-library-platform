'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookCard from '@/components/BookCard';
import type { Book } from '@/lib/types';
import type { FooterContent, HeaderContent } from '@/lib/page-data';

interface BookListPageClientProps {
  title: string;
  subtitle: string;
  books: Book[];
  filter: string;
  headerContent: HeaderContent;
  footerContent: FooterContent;
}

export default function BookListPageClient({
  title,
  subtitle,
  books,
  filter,
  headerContent,
  footerContent,
}: BookListPageClientProps) {
  const router = useRouter();

  const handleSearch = useCallback(
    (query: string) => {
      const nextPath = query ? `/?search=${encodeURIComponent(query)}` : '/';
      router.push(nextPath);
    },
    [router],
  );

  const handleBookClick = useCallback(
    (bookId: string) => {
      router.push(`/books/${bookId}`);
    },
    [router],
  );

  const handleBackToHome = useCallback(() => {
    router.push('/');
  }, [router]);

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
      <main className="bg-[#FAF7FF] py-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl md:text-4xl font-serif text-[#2D1B4E]">{title}</h1>
              <p className="text-[#6B4BA8] mt-2">{subtitle}</p>
            </motion.div>
            <motion.button
              onClick={handleBackToHome}
              className="self-start md:self-auto text-sm text-[#6B4BA8] hover:text-[#884be3] transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              হোম পেজে ফিরে যান
            </motion.button>
          </div>

          {books.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BookCard book={book} onClick={() => handleBookClick(book.id)} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-16 bg-white rounded-2xl shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-semibold text-[#2D1B4E] mb-2">কোনো বই পাওয়া যায়নি</h2>
              <p className="text-[#6B4BA8]">
                এই তালিকায় আপাতত কোনো বই নেই। একটু পর আবার চেষ্টা করুন।
              </p>
            </motion.div>
          )}
        </div>
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
