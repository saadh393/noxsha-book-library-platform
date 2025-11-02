'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, RefreshCcw } from 'lucide-react';
import { deleteBook, fetchBooks } from '@/lib/api';
import type { Book } from '@/lib/types';
import { getBookImageUrl } from '@/lib/storage';

interface StatusMessage {
  type: 'success' | 'error';
  text: string;
}

export default function AdminBooksManager() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const totalBooks = useMemo(() => books.length, [books.length]);

  async function loadBooks() {
    try {
      setIsRefreshing(true);
      const response = await fetchBooks();
      setBooks(response.data);
    } catch (error) {
      console.error('Failed to load books', error);
      setStatus({ type: 'error', text: 'বই তালিকা লোড করতে ব্যর্থ হলাম' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleDelete(bookId: string) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই বইটি মুছে ফেলতে চান?')) {
      return;
    }

    try {
      setPendingDelete(bookId);
      await deleteBook(bookId);
      setBooks((prev) => prev.filter((book) => book.id !== bookId));
      setStatus({ type: 'success', text: 'বই সফলভাবে মুছে ফেলা হয়েছে' });
    } catch (error) {
      console.error('Failed to delete book', error);
      setStatus({ type: 'error', text: 'বই মুছে ফেলতে ব্যর্থ হলাম' });
    } finally {
      setPendingDelete(null);
    }
  }

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={7} className="py-12 text-center text-[#6B4BA8]">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" size={20} />
              <span>বই তালিকা লোড হচ্ছে...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (books.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="py-16 text-center">
            <p className="text-lg text-[#6B4BA8]">কোনো বই পাওয়া যায়নি। নতুন বই যোগ করুন।</p>
          </td>
        </tr>
      );
    }

    return books.map((book) => (
      <tr key={book.id} className="border-b border-[#884be3]/10 hover:bg-[#FAF7FF] transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={getBookImageUrl(book, { width: 60, height: 80 })}
              alt={book.title}
              className="w-12 h-16 object-cover rounded shadow-sm"
            />
            <div>
              <p className="font-semibold text-[#2D1B4E]">{book.title}</p>
              <p className="text-sm text-[#6B4BA8]">{book.author}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-[#6B4BA8]">{book.category}</td>
        <td className="px-4 py-3 text-sm text-[#2D1B4E] font-medium">${book.price.toFixed(2)}</td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              book.is_bestseller ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {book.is_bestseller ? 'বেস্টসেলার' : 'সাধারণ'}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-[#6B4BA8]">
          {new Date(book.created_at).toLocaleDateString('bn-BD')}
        </td>
        <td className="px-4 py-3 text-sm text-[#6B4BA8]">
          {book.pdf_original_name ? '🎧 PDF উপলব্ধ' : '—'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin/dashboard/books/${book.id}/edit`)}
              className="px-3 py-2 rounded-lg bg-[#EDE9FE] text-[#6B4BA8] hover:bg-[#DDD6FE] transition-colors flex items-center gap-1 text-sm"
            >
              <Pencil size={16} /> সম্পাদনা
            </button>
            <button
              onClick={() => handleDelete(book.id)}
              className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
              disabled={pendingDelete === book.id}
            >
              {pendingDelete === book.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
              মুছুন
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2D1B4E]">বই ব্যবস্থাপনা</h2>
          <p className="text-sm text-[#6B4BA8] mt-1">মোট বই: {totalBooks.toLocaleString('bn-BD')}</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={loadBooks}
            className="px-4 py-2 rounded-lg border border-[#884be3]/40 text-[#6B4BA8] hover:bg-[#ECE6FF] transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isRefreshing}
          >
            <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            রিফ্রেশ
          </motion.button>
          <motion.button
            onClick={() => router.push('/admin/dashboard/books/new')}
            className="bg-[#884be3] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#6B4BA8] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            নতুন বই যোগ করুন
          </motion.button>
        </div>
      </div>

      {status && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 flex items-center gap-3 ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {status.text}
          <button onClick={() => setStatus(null)} className="ml-auto text-sm underline">
            বন্ধ করুন
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[#884be3]/10 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#F5F3FF] text-[#4C1D95] text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-semibold">বই</th>
              <th className="px-4 py-3 font-semibold">বিভাগ</th>
              <th className="px-4 py-3 font-semibold">মূল্য</th>
              <th className="px-4 py-3 font-semibold">ধরন</th>
              <th className="px-4 py-3 font-semibold">প্রকাশ</th>
              <th className="px-4 py-3 font-semibold">PDF</th>
              <th className="px-4 py-3 font-semibold text-right">ক্রিয়া</th>
            </tr>
          </thead>
          <tbody className="text-sm text-[#2D1B4E]">{renderTableBody()}</tbody>
        </table>
      </div>
    </div>
  );
}
