'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fetchSiteSettings } from '@/lib/api';

interface HighlightItem {
  author: string;
  label: string;
}

const DEFAULT_HIGHLIGHTS: HighlightItem[] = [
  { author: 'James Clear', label: 'জেমস ক্লিয়ারের সর্বশেষ লেখা' },
  { author: 'Newsletter Vol', label: 'নিউজলেটার সংস্করণের নতুনতম দিশা' },
  { author: 'Robert Kiyosaki', label: 'রবার্ট কিয়োসাকির সর্বশেষ ভাবনা' },
  { author: 'Brian Tracy', label: 'ব্রায়ান ট্রেসির নতুন অনুপ্রেরণা' },
];

const HERO_IMAGES = [
  'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg',
  'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg',
  'https://images.pexels.com/photos/7504825/pexels-photo-7504825.jpeg',
];

export default function Hero() {
  const [title, setTitle] = useState('আপনার পরবর্তী\nবইটি খুঁজে নিন');
  const [subtitle, setSubtitle] = useState(
    'প্রতিটি পাতায় অপেক্ষা করছে নতুন অভিযাত্রা। নোকশা আপনাকে অনুপ্রেরণাময় ডিজিটাল গল্পের নির্বাচিত বাছাই এনে দেয়।',
  );
  const [buttonLabel, setButtonLabel] = useState('এখনই ঘুরে দেখুন');
  const [highlights, setHighlights] = useState<HighlightItem[]>(DEFAULT_HIGHLIGHTS);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await fetchSiteSettings([
          'hero_title',
          'hero_subtitle',
          'hero_button_label',
          'hero_highlights',
        ]);
        if (!isMounted) return;

        const data = response.data;
        if (data.hero_title) {
          setTitle(data.hero_title);
        }
        if (data.hero_subtitle) {
          setSubtitle(data.hero_subtitle);
        }
        if (data.hero_button_label) {
          setButtonLabel(data.hero_button_label);
        }
        if (data.hero_highlights) {
          try {
            const parsed = JSON.parse(data.hero_highlights) as HighlightItem[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHighlights(parsed);
            }
          } catch (error) {
            console.warn('Failed to parse hero_highlights setting', error);
          }
        }
      } catch (error) {
        console.error('Failed to load hero settings', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroTitleLines = useMemo(() => title.split('\n').map((line) => line.trim()), [title]);

  return (
    <section className="bg-[#FAF7FF] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl lg:text-6xl font-serif text-[#2D1B4E] mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {heroTitleLines.map((line, index) => (
                <span key={`${line}-${index}`} className="block">
                  {line}
                </span>
              ))}
            </motion.h1>
            <motion.p
              className="text-[#6B4BA8] text-lg mb-8 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
            <motion.button
              className="bg-[#884be3] text-white px-8 py-3 rounded-md hover:bg-[#6B4BA8] transition-colors flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {buttonLabel}
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {HERO_IMAGES.map((img, index) => (
              <motion.div
                key={index}
                className="relative bg-white rounded-lg shadow-lg p-4 aspect-[3/4]"
                initial={{ opacity: 0, y: 50, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.2 + index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, rotate: index % 2 === 0 ? 2 : -2, scale: 1.05 }}
              >
                <img
                  src={img}
                  alt={`Featured book ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="flex items-center gap-8 mt-16 overflow-x-auto pb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {highlights.map((item, index) => (
            <motion.div
              key={`${item.author}-${index}`}
              className="flex items-center gap-3 min-w-max cursor-pointer"
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <div className="w-10 h-10 bg-[#884be3]/20 rounded-full flex items-center justify-center">
                <span className="text-[#884be3] font-serif">
                  {item.author.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-[#6B4BA8]">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
