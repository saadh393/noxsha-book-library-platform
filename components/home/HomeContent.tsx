"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Hero from "../Hero";
import BookSection from "../BookSection";
import CategorySection from "../CategorySection";
import Services from "../Services";
import { fetchHomeBooks, fetchSiteSettings, searchBooks as searchBooksApi } from "@/lib/api";
import type { Book } from "@/lib/types";
import { getBookImageUrl } from "@/lib/storage";

interface HomeContentProps {
    onBookClick: (bookId: string) => void;
    searchQuery: string;
}

export default function HomeContent({ onBookClick, searchQuery }: HomeContentProps) {
    const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
    const [recentBooks, setRecentBooks] = useState<Book[]>([]);
    const [bestsellerBooks, setBestsellerBooks] = useState<Book[]>([]);
    const [popularBooks, setPopularBooks] = useState<Book[]>([]);
    const [searchResults, setSearchResults] = useState<Book[]>([]);

    const [searchTitle, setSearchTitle] = useState("অনুসন্ধানের ফলাফল");
    const [searchEmptyTitle, setSearchEmptyTitle] = useState("কোনো বই পাওয়া যায়নি");
    const [searchEmptyDescription, setSearchEmptyDescription] = useState("ভিন্ন কীওয়ার্ড দিয়ে আবার অনুসন্ধান করুন");
    const [searchMetaSuffix, setSearchMetaSuffix] = useState("টি বই পাওয়া গেছে");
    const [recommendedTitle, setRecommendedTitle] = useState("আপনার জন্য প্রস্তাবিত");
    const [recentTitle, setRecentTitle] = useState("সাম্প্রতিক সংযোজন");
    const [bestsellerTitle, setBestsellerTitle] = useState("সবচেয়ে জনপ্রিয়");
    const [popularTitle, setPopularTitle] = useState("এই মাসের জনপ্রিয়");

    useEffect(() => {
        fetchBooks();
        loadCopy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (searchQuery) {
            searchBooks(searchQuery);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    async function loadCopy() {
        try {
            const { data } = await fetchSiteSettings([
                "home_search_title",
                "home_search_empty_title",
                "home_search_empty_description",
                "home_search_result_meta",
                "home_section_recommended_title",
                "home_section_recent_title",
                "home_section_bestseller_title",
                "home_section_popular_title",
            ]);

            if (data.home_search_title) setSearchTitle(data.home_search_title);
            if (data.home_search_empty_title) setSearchEmptyTitle(data.home_search_empty_title);
            if (data.home_search_empty_description) setSearchEmptyDescription(data.home_search_empty_description);
            if (data.home_search_result_meta) setSearchMetaSuffix(data.home_search_result_meta);
            if (data.home_section_recommended_title) setRecommendedTitle(data.home_section_recommended_title);
            if (data.home_section_recent_title) setRecentTitle(data.home_section_recent_title);
            if (data.home_section_bestseller_title) setBestsellerTitle(data.home_section_bestseller_title);
            if (data.home_section_popular_title) setPopularTitle(data.home_section_popular_title);
        } catch (error) {
            console.error("Failed to load home page text", error);
        }
    }

    async function fetchBooks() {
        try {
            const { recommended, recent, bestsellers, popular } = await fetchHomeBooks();

            setRecommendedBooks(recommended);
            setRecentBooks(recent);
            setBestsellerBooks(bestsellers);
            setPopularBooks(popular);
        } catch (error) {
            console.error("Failed to load books", error);
        }
    }

    async function searchBooks(query: string) {
        try {
            const { data } = await searchBooksApi(query);
            setSearchResults(data || []);
        } catch (error) {
            console.error("Failed to search books", error);
        }
    }

    const searchCountLabel = useMemo(() => {
        const suffix = searchMetaSuffix || "টি বই পাওয়া গেছে";
        return `${searchResults.length.toLocaleString("bn-BD")} ${suffix}`.trim();
    }, [searchMetaSuffix, searchResults.length]);

    if (searchQuery && searchResults.length >= 0) {
        return (
            <div className="min-h-screen bg-[#FAF7FF] py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.h2
                        className="text-3xl font-serif text-[#2D1B4E] mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {searchTitle}
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
                                                    src={getBookImageUrl(book, { width: 300, height: 400 })}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="font-semibold text-[#2D1B4E] mb-1 line-clamp-2">
                                                {book.title}
                                            </h3>
                                            <p className="text-sm text-[#6B4BA8]">লেখক {book.author}</p>
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
                                {searchEmptyTitle}
                            </h3>
                            <p className="text-[#6B4BA8]">{searchEmptyDescription}</p>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <Hero />
            <BookSection
                id="ebook"
                title={recommendedTitle}
                books={recommendedBooks}
                onBookClick={onBookClick}
            />
            <CategorySection />
            <BookSection
                title={recentTitle}
                books={recentBooks}
                onBookClick={onBookClick}
            />
            <BookSection
                title={bestsellerTitle}
                books={bestsellerBooks}
                onBookClick={onBookClick}
            />
            <Services />
            <BookSection
                title={popularTitle}
                books={popularBooks}
                onBookClick={onBookClick}
            />
        </>
    );
}
