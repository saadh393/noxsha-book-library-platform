"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Star,
    Download,
    Share2,
    TrendingUp,
    Loader2,
} from "lucide-react";
import BookCard from "../BookCard";
import DownloadModal from "../DownloadModal";
import {
    fetchBookDetails,
    requestBookDownload,
    startBkashPayment,
} from "@/lib/api";
import type { Book } from "@/lib/types";
import { getBookImageUrl } from "@/lib/storage";
import { formatCurrency, isFreePrice } from "@/lib/price";

type TabKey = "description" | "details";

interface BookDetailsProps {
    bookId: string;
    onBack: () => void;
    onBookClick: (bookId: string) => void;
    initialBook?: Book | null;
    initialRelated?: Book[];
}

export default function BookDetails({
    bookId,
    onBack,
    onBookClick,
    initialBook = null,
    initialRelated = [],
}: BookDetailsProps) {
    const searchParams = useSearchParams();
    const [book, setBook] = useState<Book | null>(initialBook);
    const [relatedBooks, setRelatedBooks] = useState<Book[]>(initialRelated);
    const [selectedTab, setSelectedTab] = useState<TabKey>("description");
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isStartingPayment, setIsStartingPayment] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [handledQuerySignature, setHandledQuerySignature] = useState<
        string | null
    >(null);
    const [hasUnlockedPaidBook, setHasUnlockedPaidBook] = useState(false);
    const PAID_BOOK_STORAGE_KEY = "noxsha_paid_books";
    const tabLabels: Record<TabKey, string> = {
        description: "বর্ণনা",
        details: "বিস্তারিত",
    };
    const isFreeBook = useMemo(
        () => (book ? isFreePrice(book.price) : false),
        [book]
    );

    const readPaidBookCache = useCallback(() => {
        if (typeof window === "undefined") {
            return {};
        }
        try {
            const raw = window.localStorage.getItem(PAID_BOOK_STORAGE_KEY);
            return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        } catch (error) {
            console.error("Failed to read paid book cache", error);
            return {};
        }
    }, []);

    const rememberPaidBook = useCallback(
        (bookId: string, paymentID?: string | null) => {
            if (typeof window === "undefined") return;
            try {
                const cache = readPaidBookCache();
                cache[bookId] = {
                    unlockedAt: new Date().toISOString(),
                    paymentID: paymentID ?? null,
                };
                window.localStorage.setItem(
                    PAID_BOOK_STORAGE_KEY,
                    JSON.stringify(cache)
                );
                setHasUnlockedPaidBook(true);
            } catch (error) {
                console.error("Failed to persist paid book cache", error);
            }
        },
        [readPaidBookCache]
    );

    const hasPaidAccess = useCallback(
        (targetBookId: string) => {
            const cache = readPaidBookCache();
            return Boolean(cache[targetBookId]);
        },
        [readPaidBookCache]
    );

    const clearPaymentParams = useCallback(() => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        url.searchParams.delete("paymentStatus");
        url.searchParams.delete("paymentID");
        url.searchParams.delete("reason");
        window.history.replaceState({}, document.title, url.toString());
    }, []);

    const handleDirectDownload = useCallback(async () => {
        if (!book) return;
        setPaymentError(null);
        setIsDownloading(true);
        try {
            const { downloadUrl } = await requestBookDownload(book.id);
            window.open(downloadUrl, "_blank", "noopener");
        } catch (error) {
            console.error("Failed to open download link", error);
            setPaymentError("ডাউনলোড লিংক খুলতে পারিনি। পরে আবার চেষ্টা করুন।");
        } finally {
            setIsDownloading(false);
        }
    }, [book]);

    useEffect(() => {
        let isMounted = true;

        async function fetchBookDetailsData() {
            try {
                const { book: bookData, related } = await fetchBookDetails(
                    bookId
                );
                if (!isMounted) return;
                setBook(bookData);
                setRelatedBooks(related);
            } catch (error) {
                console.error("Failed to load book details", error);
            }
        }

        if (initialBook && initialBook.id === bookId) {
            setBook(initialBook);
            setRelatedBooks(initialRelated);
        } else {
            setBook(null);
            setRelatedBooks([]);
        }

        fetchBookDetailsData();
        window.scrollTo({ top: 0, behavior: "smooth" });

        return () => {
            isMounted = false;
        };
    }, [bookId, initialBook?.id]);

    useEffect(() => {
        if (!book) return;
        setHasUnlockedPaidBook(hasPaidAccess(book.id));
    }, [book, hasPaidAccess]);

    useEffect(() => {
        if (!book) return;
        const status = searchParams.get("paymentStatus");
        const paymentId = searchParams.get("paymentID");

        if (!status) {
            setHandledQuerySignature(null);
            return;
        }

        const signature = `${status}:${paymentId ?? ""}:${book.id}`;
        if (handledQuerySignature === signature) {
            return;
        }

        if (status === "success") {
            setHandledQuerySignature(signature);
            rememberPaidBook(book.id, paymentId);
            handleDirectDownload();
            clearPaymentParams();
        } else if (status === "failed" || status === "cancelled") {
            setHandledQuerySignature(signature);
            setPaymentError(
                status === "failed"
                    ? "পেমেন্ট সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।"
                    : "আপনি পেমেন্ট প্রক্রিয়া বাতিল করেছেন।"
            );
            clearPaymentParams();
        }
    }, [
        book,
        searchParams,
        handledQuerySignature,
        rememberPaidBook,
        handleDirectDownload,
        clearPaymentParams,
    ]);

    if (!book) {
        return (
            <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#884be3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const hasDiscount =
        !isFreeBook &&
        typeof book.old_price === "number" &&
        book.old_price > book.price;
    const priceLabel = isFreeBook
        ? "বিনামূল্যে"
        : formatCurrency(Number(book.price) || 0);
    const oldPriceLabel =
        hasDiscount && typeof book.old_price === "number"
            ? formatCurrency(book.old_price)
            : null;
    const discountPercent =
        hasDiscount && typeof book.old_price === "number"
            ? Math.max(
                  1,
                  Math.round(
                      ((book.old_price - book.price) / book.old_price) * 100
                  )
              )
            : null;

    return (
        <motion.div
            className="min-h-screen bg-[#FAF7FF]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="max-w-7xl mx-auto px-6 py-8">
                <motion.button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[#6B4BA8] hover:text-[#884be3] mb-8 transition-colors"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{ x: -5 }}
                >
                    <ArrowLeft size={20} />
                    বই তালিকায় ফিরে যান
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-2xl p-8 aspect-[3/4] flex items-center justify-center"
                            whileHover={{ scale: 1.02, rotate: 1 }}
                        >
                            <img
                                src={getBookImageUrl(book, {
                                    width: 400,
                                    height: 560,
                                })}
                                alt={book.title}
                                className="max-h-full max-w-full object-contain"
                            />
                        </motion.div>

                        {book.is_bestseller && (
                            <motion.div
                                className="absolute top-4 right-4 bg-[#884be3] text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.4, type: "spring" }}
                            >
                                <TrendingUp size={16} />
                                বেস্টসেলার
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.h1
                            className="text-4xl font-serif text-[#2D1B4E] mb-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {book.title}
                        </motion.h1>

                        <motion.p
                            className="text-xl text-[#6B4BA8] mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            লেখক {book.author}
                        </motion.p>

                        <motion.div
                            className="flex items-center gap-4 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7 + i * 0.05 }}
                                    >
                                        <Star
                                            size={20}
                                            className={
                                                i < Math.floor(book.rating)
                                                    ? "fill-[#F59E0B] text-[#F59E0B]"
                                                    : "text-gray-300"
                                            }
                                        />
                                    </motion.div>
                                ))}
                            </div>
                            <span className="text-lg font-semibold text-[#2D1B4E]">
                                {book.rating.toLocaleString("bn-BD", {
                                    maximumFractionDigits: 1,
                                })}
                            </span>
                        </motion.div>

                        <motion.div
                            className="flex flex-wrap items-center gap-4 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <span className="text-4xl font-bold text-[#884be3]">
                                {priceLabel}
                            </span>
                            {oldPriceLabel && (
                                <span className="text-xl text-gray-400 line-through">
                                    {oldPriceLabel}
                                </span>
                            )}
                            {discountPercent && (
                                <motion.span
                                    className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.9, type: "spring" }}
                                >
                                    {discountPercent}% ছাড়
                                </motion.span>
                            )}
                            {!discountPercent && (
                                <motion.span
                                    className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.9, type: "spring" }}
                                >
                                    ডিজিটাল ই-বুক
                                </motion.span>
                            )}
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-lg p-6 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                        >
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-[#6B4BA8]">
                                        ক্যাটেগরি:
                                    </span>
                                    <span className="ml-2 font-semibold text-[#2D1B4E]">
                                        {book.category}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#6B4BA8]">
                                        ফরম্যাট:
                                    </span>
                                    <span className="ml-2 font-semibold text-green-600">
                                        পিডিএফ / ইপাব
                                    </span>
                                </div>
                                <div>
                                    <span className="ml-2 font-semibold text-[#2D1B4E]">
                                        {book.sales_count.toLocaleString(
                                            "bn-BD"
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#6B4BA8]">
                                        ভাষা:
                                    </span>
                                    <span className="ml-2 font-semibold text-[#2D1B4E]">
                                        ইংরেজি
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex gap-4 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                        >
                            <motion.button
                                onClick={async () => {
                                    if (isFreeBook) {
                                        setIsDownloadModalOpen(true);
                                        return;
                                    }
                                    if (hasUnlockedPaidBook) {
                                        handleDirectDownload();
                                        return;
                                    }
                                    if (!book) return;
                                    setPaymentError(null);
                                    setIsStartingPayment(true);
                                    try {
                                        const { redirectUrl } =
                                            await startBkashPayment(book.id);
                                        window.location.href = redirectUrl;
                                    } catch (error) {
                                        console.error(
                                            "Failed to start bKash payment",
                                            error
                                        );
                                        setPaymentError(
                                            error instanceof Error
                                                ? error.message
                                                : "bKash পেমেন্ট শুরু করা যায়নি।"
                                        );
                                    } finally {
                                        setIsStartingPayment(false);
                                    }
                                }}
                                disabled={isStartingPayment || isDownloading}
                                className="flex-1 bg-gradient-to-r from-[#884be3] to-[#6B4BA8] text-white px-8 py-4 rounded-lg hover:shadow-xl transition-shadow font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isStartingPayment || isDownloading ? (
                                    <>
                                        <Loader2
                                            className="animate-spin"
                                            size={20}
                                        />
                                        {isFreeBook
                                            ? "প্রসেসিং..."
                                            : "bKash প্রসেস হচ্ছে"}
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        {isFreeBook
                                            ? "ই-বুক ডাউনলোড করুন"
                                            : hasUnlockedPaidBook
                                            ? "আবার ডাউনলোড করুন"
                                            : "bKash দিয়ে পেমেন্ট করুন"}
                                    </>
                                )}
                            </motion.button>

                            <motion.button
                                className="border-2 border-[#884be3] px-6 py-4 rounded-lg hover:bg-[#FAF7FF] transition-colors"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Share2 size={20} className="text-[#884be3]" />
                            </motion.button>
                        </motion.div>

                        <div className="flex flex-col gap-2 text-center">
                            {paymentError && (
                                <motion.p
                                    className="text-sm text-red-600"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {paymentError}
                                </motion.p>
                            )}
                            {!isFreeBook &&
                                hasUnlockedPaidBook &&
                                !paymentError && (
                                    <motion.p
                                        className="text-sm text-green-600"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        আপনি এই বইটির জন্য পূর্বে পেমেন্ট
                                        করেছেন। সরাসরি ডাউনলোড করতে পারেন।
                                    </motion.p>
                                )}
                            <motion.p
                                className="text-sm text-[#6B4BA8]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1 }}
                            >
                                {isFreeBook
                                    ? "বিনামূল্যে ডাউনলোড। কোনো অর্থপ্রদান প্রয়োজন নেই।"
                                    : "পেমেন্টের জন্য bKash ব্যবহার করুন। সফল হলে ডাউনলোড স্বয়ংক্রিয়ভাবে শুরু হবে।"}
                            </motion.p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="bg-white rounded-2xl shadow-lg p-8 mb-16"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex gap-6 border-b border-gray-200 mb-6">
                        {(["description", "details"] as const).map((tab) => (
                            <motion.button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`pb-4 px-2 font-semibold capitalize transition-colors relative ${
                                    selectedTab === tab
                                        ? "text-[#884be3]"
                                        : "text-[#6B4BA8]"
                                }`}
                                whileHover={{ y: -2 }}
                            >
                                {tabLabels[tab]}
                                {selectedTab === tab && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#884be3]"
                                        layoutId="activeTab"
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {selectedTab === "description" && (
                                <div className="prose max-w-none">
                                    <p className="text-[#6B4BA8] leading-relaxed">
                                        {book.description}
                                    </p>
                                    <p className="text-[#6B4BA8] leading-relaxed mt-4">
                                        সুচারুভাবে নির্বাচিত এই বই পাঠকদের
                                        মনোমুগ্ধকর গল্পের পাশাপাশি মূল্যবান
                                        অন্তর্দৃষ্টি দেয়। অবসরে পড়া কিংবা
                                        অভ্যাসবশত পাঠ—সবক্ষেত্রেই এটি আপনার
                                        সংগ্রহে বিশেষ স্থান করে নেবে।
                                    </p>
                                </div>
                            )}

                            {selectedTab === "details" && (
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        ["লেখক", book.author],
                                        ["ক্যাটেগরি", book.category],
                                        [
                                            "রেটিং",
                                            `${book.rating.toLocaleString(
                                                "bn-BD",
                                                { maximumFractionDigits: 1 }
                                            )} / ৫`,
                                        ],
                                        [
                                            "ডাউনলোড",
                                            book.sales_count.toLocaleString(
                                                "bn-BD"
                                            ),
                                        ],
                                        ["ফরম্যাট", "পিডিএফ, ইপাব"],
                                        ["ভাষা", "ইংরেজি"],
                                    ].map(([label, value], i) => (
                                        <motion.div
                                            key={label}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <span className="text-[#6B4BA8] block mb-1">
                                                {label}
                                            </span>
                                            <span className="font-semibold text-[#2D1B4E]">
                                                {value}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {relatedBooks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h2 className="text-3xl font-serif text-[#2D1B4E] mb-8">
                            অনুরূপ বই
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {relatedBooks.map((relatedBook, index) => (
                                <motion.div
                                    key={relatedBook.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                >
                                    <BookCard
                                        book={relatedBook}
                                        onClick={() =>
                                            onBookClick(relatedBook.id)
                                        }
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <DownloadModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                bookTitle={book.title}
                bookId={book.id}
            />
        </motion.div>
    );
}
