'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Book } from '@/lib/types';
import { getBookImageUrl } from '@/lib/storage';
import { formatCurrency, isFreePrice } from '@/lib/price';

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const isFree = isFreePrice(book.price);
  const hasDiscount =
    !isFree && typeof book.old_price === 'number' && book.old_price > book.price;
  const priceLabel = isFree ? 'বিনামূল্যে' : formatCurrency(book.price);
  const oldPriceLabel =
    hasDiscount && typeof book.old_price === 'number'
      ? formatCurrency(book.old_price)
      : null;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer group relative"
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
    >
      {book.is_bestseller && (
        <motion.div
          className="absolute top-2 right-2 bg-[#884be3] text-white text-xs px-2 py-1 rounded-full z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          বেস্টসেলার
        </motion.div>
      )}

      <div className="relative mb-4 aspect-[3/4] bg-gray-100 rounded overflow-hidden">
        <motion.img
          src={getBookImageUrl(book, { width: 300, height: 400 })}
          alt={book.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </div>

      <h3 className="font-semibold text-[#2D1B4E] mb-1 line-clamp-2 group-hover:text-[#884be3] transition-colors">
        {book.title}
      </h3>
      <p className="text-sm text-[#6B4BA8] mb-2">লেখক {book.author}</p>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(book.rating) ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'}
            />
          ))}
        </div>
        <span className="text-sm text-[#6B4BA8]">
          {book.rating.toLocaleString('bn-BD', { maximumFractionDigits: 1 })}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-[#2D1B4E]">
            {priceLabel}
          </span>
          {oldPriceLabel && (
            <span className="text-sm text-gray-400 line-through">{oldPriceLabel}</span>
          )}
        </div>
        <span className="text-xs text-green-600 font-medium">
          {isFree ? 'বিনামূল্যে' : 'মূল্য'}
        </span>
      </div>
    </motion.div>
  );
}
