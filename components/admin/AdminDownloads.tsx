'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, BookOpen, Mail, Phone, MapPin, Search } from 'lucide-react';
import { fetchDownloads } from '@/lib/api';
import type { Download as DownloadRecord } from '@/lib/types';

export default function AdminDownloads() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDownloads();
  }, []);

  async function loadDownloads() {
    try {
      setIsLoading(true);
      const { data } = await fetchDownloads();
      setDownloads(data ?? []);
      setError(null);
    } catch (err) {
      console.error('Failed to load download records', err);
      setError('ডাউনলোড তথ্য লোড করতে ব্যর্থ হয়েছি');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredDownloads = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return downloads;
    return downloads.filter((item) =>
      [
        item.name,
        item.email,
        item.phone,
        item.address,
        item.book_title ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [downloads, searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2D1B4E] flex items-center gap-2">
            <Download size={28} className="text-[#884be3]" />
            ডাউনলোড রিকোয়েস্ট
          </h2>
          <p className="text-sm text-[#6B4BA8] mt-1">
            মোট {downloads.length.toLocaleString('bn-BD')} টি ব্যবহারকারী সাবমিশন সংরক্ষিত আছে।
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4BA8]"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="নাম, ইমেল, বই..."
            className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#884be3]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F3FF] text-[#4C1D95] uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">ব্যবহারকারী</th>
                  <th className="px-4 py-3 font-semibold">যোগাযোগ</th>
                  <th className="px-4 py-3 font-semibold">ঠিকানা</th>
                  <th className="px-4 py-3 font-semibold">বই</th>
                  <th className="px-4 py-3 font-semibold">সাবমিশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredDownloads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#6B4BA8]">
                      কোনো রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredDownloads.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#884be3]/10 hover:bg-[#FAF7FF] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#2D1B4E]">{item.name}</p>
                        <p className="text-xs text-[#6B4BA8]">আইডি: {item.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-4 space-y-1 text-[#6B4BA8]">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail size={14} />
                          <a href={`mailto:${item.email}`} className="hover:text-[#884be3]">
                            {item.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Phone size={14} />
                          <span>{item.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2 text-xs text-[#6B4BA8]">
                          <MapPin size={14} className="mt-0.5" />
                          <span>{item.address}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2 text-xs text-[#6B4BA8]">
                          <BookOpen size={14} className="mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2D1B4E]">
                              {item.book_title ?? 'অজানা বই'}
                            </p>
                            <p className="text-[11px] text-[#6B4BA8]">ID: {item.book_id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#6B4BA8]">
                        {new Date(item.created_at).toLocaleString('bn-BD', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
