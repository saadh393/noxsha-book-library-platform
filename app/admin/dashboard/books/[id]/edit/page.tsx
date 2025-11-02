"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { fetchBookDetails, updateBook, uploadToStorage } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Book } from "@/lib/types";

const CATEGORY_OPTIONS = [
    "General",
    "History",
    "Science Fiction",
    "Self-improvement",
    "Psychology",
    "Business",
    "Finance",
    "Communication",
    "Fiction",
    "Classics",
    "Thriller",
    "Adventure",
    "Health",
    "Technology",
];

export default function AdminBookEditPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const bookId = params?.id ?? "";

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [book, setBook] = useState<Book | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        category: "General",
        description: "",
        price: 0,
        old_price: null as number | null,
        rating: 4.5,
        is_bestseller: false,
        is_new: false,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageStorageName, setImageStorageName] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [pdfOriginalName, setPdfOriginalName] = useState<string | null>(null);
    const [pdfStorageName, setPdfStorageName] = useState<string | null>(null);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);

    useEffect(() => {
        (async () => {
            const session = await getSession();
            if (!session) {
                setIsCheckingAuth(false);
                router.replace("/admin/login");
                return;
            }

            setIsAuthorized(true);
            setIsCheckingAuth(false);
        })();
    }, [router]);

    useEffect(() => {
        if (!bookId) return;
        (async () => {
            try {
                const response = await fetchBookDetails(bookId);
                const currentBook = response.book;
                setBook(currentBook);
                setFormData({
                    title: currentBook.title,
                    author: currentBook.author,
                    category: currentBook.category,
                    description: currentBook.description,
                    price: currentBook.price,
                    old_price: currentBook.old_price,
                    rating: currentBook.rating,
                    is_bestseller: currentBook.is_bestseller,
                    is_new: currentBook.is_new,
                });
                setImagePreview(currentBook.image_url);
                setImageStorageName(currentBook.image_storage_name);
                setPdfOriginalName(currentBook.pdf_original_name);
                setPdfStorageName(currentBook.pdf_storage_name);
            } catch (error) {
                console.error("Failed to fetch book", error);
                setStatusMessage("বইয়ের তথ্য লোড করতে ব্যর্থ হলাম");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [bookId]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (type === "number") {
            setFormData((prev) => ({ ...prev, [name]: value === "" ? 0 : parseFloat(value) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    async function handleUploadImage(file: File) {
        setIsUploadingImage(true);
        try {
            const response = await uploadToStorage(file, "image");
            const data = response.data;
            setImagePreview(data.url ?? null);
            setImageStorageName(data.storage_name ?? null);
            setStatusMessage("ইমেজ আপডেট সম্পন্ন হয়েছে");
        } catch (error) {
            console.error("Image upload failed", error);
            setStatusMessage("ইমেজ আপলোড করতে ব্যর্থ হলাম");
        } finally {
            setIsUploadingImage(false);
        }
    }

    async function handleUploadPdf(file: File) {
        setIsUploadingPdf(true);
        try {
            const response = await uploadToStorage(file, "pdf");
            const data = response.data;
            setPdfStorageName(data.storage_name ?? null);
            setPdfOriginalName(file.name);
            setStatusMessage("পিডিএফ আপডেট করা হয়েছে");
        } catch (error) {
            console.error("PDF upload failed", error);
            setStatusMessage("পিডিএফ আপলোড করতে ব্যর্থ হলাম");
        } finally {
            setIsUploadingPdf(false);
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!book) return;

        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            await updateBook(book.id, {
                ...formData,
                image_url: imagePreview,
                image_storage_name: imageStorageName,
                pdf_storage_name: pdfStorageName,
                pdf_original_name: pdfOriginalName,
            });

            setStatusMessage("বইয়ের তথ্য সফলভাবে হালনাগাদ হয়েছে");
            router.push("/admin/dashboard");
        } catch (error) {
            console.error("Failed to update book", error);
            setStatusMessage("বই আপডেট করতে ব্যর্থ হলাম");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingAuth || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-12 h-12 border-4 border-[#884be3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthorized || !book) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FAF7FF]">
            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2D1B4E]">বই সম্পাদনা করুন</h1>
                        <p className="text-[#6B4BA8] mt-2">
                            বইয়ের তথ্য পরিবর্তন করে সংরক্ষণ করুন।
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#884be3]/40 text-[#6B4BA8] hover:bg-[#ECE6FF] transition-colors"
                    >
                        <ArrowLeft size={18} /> বই ব্যবস্থাপনায় ফেরত যান
                    </button>
                </div>

                {statusMessage && (
                    <div className="mb-6 rounded-lg bg-[#EDE9FE] border border-[#DDD6FE] text-[#4C1D95] px-4 py-3">
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-lg p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">শিরোনাম *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">লেখক *</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">বিভাগ *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                            >
                                {CATEGORY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">মূল্য ($) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">পুরনো মূল্য ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="old_price"
                                    value={formData.old_price ?? ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">রেটিং *</label>
                            <input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                name="rating"
                                value={formData.rating}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                            />
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm text-[#2D1B4E]">
                                <input
                                    type="checkbox"
                                    name="is_bestseller"
                                    checked={formData.is_bestseller}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded"
                                />
                                বেস্টসেলার
                            </label>
                            <label className="flex items-center gap-2 text-sm text-[#2D1B4E]">
                                <input
                                    type="checkbox"
                                    name="is_new"
                                    checked={formData.is_new}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded"
                                />
                                নতুন
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">বর্ণনা *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={5}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-dashed border-[#884be3]/40 rounded-lg p-6 bg-[#FAF7FF]">
                            <h3 className="text-[#2D1B4E] font-semibold mb-2">কভার ছবি পরিবর্তন</h3>
                            <p className="text-sm text-[#6B4BA8] mb-4">JPEG/PNG ফরম্যাট, সর্বোচ্চ 5MB।</p>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#884be3]/40 rounded-lg text-[#6B4BA8] cursor-pointer hover:bg-[#ECE6FF] transition-colors">
                                <Upload size={18} />
                                ছবি নির্বাচন করুন
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        setImagePreview(URL.createObjectURL(file));
                                        handleUploadImage(file);
                                    }}
                                />
                            </label>
                            {isUploadingImage && (
                                <p className="text-xs text-[#6B4BA8] mt-3 flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={14} /> আপলোড হচ্ছে...
                                </p>
                            )}
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Cover preview"
                                    className="mt-4 rounded-lg shadow-md w-40 h-56 object-cover"
                                />
                            )}
                        </div>

                        <div className="border border-dashed border-[#884be3]/40 rounded-lg p-6 bg-[#FAF7FF]">
                            <h3 className="text-[#2D1B4E] font-semibold mb-2">পিডিএফ আপডেট</h3>
                            <p className="text-sm text-[#6B4BA8] mb-4">PDF ডকুমেন্ট, সর্বোচ্চ 32MB।</p>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#884be3]/40 rounded-lg text-[#6B4BA8] cursor-pointer hover:bg-[#ECE6FF] transition-colors">
                                <Upload size={18} />
                                নতুন পিডিএফ নির্বাচন করুন
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        handleUploadPdf(file);
                                    }}
                                />
                            </label>
                            {isUploadingPdf && (
                                <p className="text-xs text-[#6B4BA8] mt-3 flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={14} /> আপলোড হচ্ছে...
                                </p>
                            )}
                            {pdfOriginalName && !isUploadingPdf && (
                                <p className="text-sm text-[#2D1B4E] mt-3">বর্তমান ফাইল: {pdfOriginalName}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/dashboard")}
                            className="px-4 py-2 rounded-lg border border-[#884be3]/40 text-[#6B4BA8] hover:bg-[#ECE6FF] transition-colors"
                            disabled={isSubmitting}
                        >
                            বাতিল করুন
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploadingImage || isUploadingPdf}
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#884be3] to-[#6B4BA8] text-white font-semibold flex items-center gap-2 disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    সংরক্ষণ হচ্ছে...
                                </>
                            ) : (
                                "পরিবর্তন সংরক্ষণ করুন"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
