'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { HomeCopyContent } from '@/lib/page-data';
import type { Book } from '@/lib/types';
import { searchBooks as searchBooksApi } from '@/lib/api';
import { getBookImageUrl } from '@/lib/storage';
import { formatCurrency, isFreePrice } from '@/lib/price';

interface SearchOverlayProps {
  isOpen: boolean;
  query: string;
  copy: HomeCopyContent;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onBookClick: (bookId: string) => void;
}

export default function SearchOverlay({
  isOpen,
  query,
  copy,
  onQueryChange,
  onClose,
  onBookClick,
}: SearchOverlayProps) {
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setResults([]);
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    searchBooksApi(trimmed)
      .then(({ data }) => {
        if (!cancelled) {
          setResults(data ?? []);
        }
      })
      .catch((error) => {
        console.error('Failed to search books', error);
        if (!cancelled) {
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, query]);

  const searchCountLabel = useMemo(() => {
    const suffix = copy.searchMetaSuffix || 'টি বই পাওয়া গেছে';
    return `${results.length.toLocaleString('bn-BD')} ${suffix}`.trim();
  }, [copy.searchMetaSuffix, results.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center flex-1 gap-3 bg-gray-50 rounded-full px-4 py-2.5">
                <Search size={18} className="text-[#884be3]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="কোন বইটি খুঁজছেন?"
                  className="flex-1 bg-transparent outline-none text-sm md:text-base"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => onQueryChange('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6 bg-[#FAF7FF]">
              {query.trim().length === 0 ? (
                <div className="text-center text-[#6B4BA8] py-10">
                  কিছু লিখুন এবং ফলাফল দেখুন।
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-10 h-10 border-4 border-[#884be3] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="text-sm text-[#6B4BA8] mb-4">
                    "{query}" অনুসন্ধানে {searchCountLabel}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((book) => {
                      const freeBook = isFreePrice(book.price);
                      const hasDiscount =
                        !freeBook &&
                        typeof book.old_price === 'number' &&
                        book.old_price > book.price;
                      const priceLabel = freeBook
                        ? 'বিনামূল্যে'
                        : formatCurrency(book.price);
                      const oldPriceLabel =
                        hasDiscount && typeof book.old_price === 'number'
                          ? formatCurrency(book.old_price)
                          : null;

                      return (
                        <motion.button
                          key={book.id}
                          type="button"
                          className="text-left bg-white rounded-2xl p-4 shadow hover:shadow-lg transition-shadow flex gap-4"
                          whileHover={{ y: -4 }}
                          onClick={() => onBookClick(book.id)}
                        >
                        <div className="w-20 h-28 rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={getBookImageUrl(book, { width: 200, height: 300 })}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#2D1B4E] line-clamp-2">
                              {book.title}
                            </h3>
                            <p className="text-sm text-[#6B4BA8] mt-1">লেখক {book.author}</p>
                            <div className="mt-3 flex items-baseline gap-2">
                              <span className="text-sm font-semibold text-[#2D1B4E]">
                                {priceLabel}
                              </span>
                              {oldPriceLabel && (
                                <span className="text-xs text-gray-400 line-through">
                                  {oldPriceLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#A38EC9] mt-1">{book.category}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-semibold text-[#2D1B4E] mb-2">
                    {copy.searchEmptyTitle}
                  </h3>
                  <p className="text-[#6B4BA8]">{copy.searchEmptyDescription}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
