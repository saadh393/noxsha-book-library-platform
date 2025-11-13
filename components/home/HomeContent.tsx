'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BookSection from '../BookSection';
import CategorySection from '../CategorySection';
import Services from '../Services';
import { searchBooks as searchBooksApi } from '@/lib/api';
import type { Book } from '@/lib/types';
import { getBookImageUrl } from '@/lib/storage';
import type {
  CategorySectionContent,
  HomeCopyContent,
  HomeSectionsContent,
  ServicesSectionContent,
} from '@/lib/page-data';

interface HomeContentProps {
    onBookClick: (bookId: string) => void;
    searchQuery: string;
    initialSearchQuery?: string;
    sections: HomeSectionsContent;
    copy: HomeCopyContent;
    categorySection: CategorySectionContent;
    servicesSection: ServicesSectionContent;
    initialSearchResults?: Book[];
    hasServerSearchResults?: boolean;
}

export default function HomeContent({
    onBookClick,
    searchQuery,
    initialSearchQuery,
    sections,
    copy,
    categorySection,
    servicesSection,
    initialSearchResults,
    hasServerSearchResults,
}: HomeContentProps) {
    const [searchResults, setSearchResults] = useState<Book[]>(
        initialSearchResults ?? []
    );
    const skipQueryRef = useRef(
        hasServerSearchResults && initialSearchQuery ? initialSearchQuery : ""
    );

    useEffect(() => {
        if (hasServerSearchResults && typeof initialSearchQuery === "string") {
            setSearchResults(initialSearchResults ?? []);
            skipQueryRef.current = initialSearchQuery;
        }
    }, [
        hasServerSearchResults,
        initialSearchQuery,
        initialSearchResults,
    ]);

    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            skipQueryRef.current = "";
            return;
        }

        if (skipQueryRef.current && searchQuery === skipQueryRef.current) {
            skipQueryRef.current = "";
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const { data } = await searchBooksApi(searchQuery);
                if (!cancelled) {
                    setSearchResults(data || []);
                }
            } catch (error) {
                console.error("Failed to search books", error);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [searchQuery]);

    const searchCountLabel = useMemo(() => {
        const suffix = copy.searchMetaSuffix || "টি বই পাওয়া গেছে";
        return `${searchResults.length.toLocaleString(
            "bn-BD"
        )} ${suffix}`.trim();
    }, [copy.searchMetaSuffix, searchResults.length]);

    if (searchQuery && searchResults.length >= 0) {
        return (
            <div className="min-h-screen bg-[#FAF7FF] py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.h2
                        className="text-3xl font-serif text-[#2D1B4E] mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {copy.searchTitle}
                    </motion.h2>
                    <motion.p
                        className="text-[#6B4BA8] mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        "{searchQuery}" অনুসন্ধানে {searchCountLabel}
                    </motion.p>

                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {searchResults.map((book, index) => (
                                <motion.div
                                    key={book.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div onClick={() => onBookClick(book.id)}>
                                        <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl transition-shadow">
                                            <div className="relative mb-4 aspect-[3/4] bg-gray-100 rounded overflow-hidden">
                                                <img
                                                    src={getBookImageUrl(book, {
                                                        width: 300,
                                                        height: 400,
                                                    })}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="font-semibold text-[#2D1B4E] mb-1 line-clamp-2">
                                                {book.title}
                                            </h3>
                                            <p className="text-sm text-[#6B4BA8]">
                                                লেখক {book.author}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            className="text-center py-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-2xl font-semibold text-[#2D1B4E] mb-2">
                        {copy.searchEmptyTitle}
                            </h3>
                            <p className="text-[#6B4BA8]">
                                {copy.searchEmptyDescription}
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            {sections.recommended.length > 0 && (
                <BookSection
                    title={copy.recommendedTitle}
                    books={sections.recommended}
                    onBookClick={onBookClick}
                    filterType="recommended"
                />
            )}
            {sections.recent.length > 0 && (
                <BookSection
                    title={copy.recentTitle}
                    books={sections.recent}
                    onBookClick={onBookClick}
                    filterType="recent"
                />
            )}
            <CategorySection
                title={categorySection.title}
                ctaLabel={categorySection.ctaLabel}
                categories={categorySection.categories}
            />

            {sections.popular.length > 0 && (
                <BookSection
                    title={copy.popularTitle}
                    books={sections.popular}
                    onBookClick={onBookClick}
                    filterType="popular"
                />
            )}

            {sections.bestsellers.length > 0 && (
                <BookSection
                    title={copy.bestsellerTitle}
                    books={sections.bestsellers}
                    onBookClick={onBookClick}
                    filterType="bestseller"
                />
            )}

            <Services
                title={servicesSection.title}
                ctaLabel={servicesSection.ctaLabel}
                services={servicesSection.services}
            />
        </>
    );
}
