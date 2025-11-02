'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Book } from '@/lib/types';
import BookCard from './BookCard';

interface BookSectionProps {
  id?: string;
  title: string;
  books: Book[];
  onBookClick: (bookId: string) => void;
}

export default function BookSection({ id, title, books, onBookClick }: BookSectionProps) {
  return (
    <section id={id} className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif text-[#2D1B4E]">{title}</h2>
          <motion.button
            className="flex items-center gap-2 text-[#6B4BA8] hover:text-[#884be3] transition-colors"
            whileHover={{ x: 5 }}
          >
            সব দেখুন
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <BookCard book={book} onClick={() => onBookClick(book.id)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
