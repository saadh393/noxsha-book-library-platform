'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Heart,
  LucideIcon,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { fetchHighlightCategories, fetchSiteSettings } from '@/lib/api';
import type { HighlightCategory } from '@/lib/types';

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Users,
  Sparkles,
  TrendingUp,
  Heart,
};

export default function CategorySection() {
  const [title, setTitle] = useState('বিভাগ');
  const [ctaLabel, setCtaLabel] = useState('সব দেখুন');
  const [categories, setCategories] = useState<HighlightCategory[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [settingsResponse, categoriesResponse] = await Promise.all([
          fetchSiteSettings(['category_section_title', 'category_section_cta_label']),
          fetchHighlightCategories(),
        ]);

        if (!isMounted) return;

        const settings = settingsResponse.data;
        if (settings.category_section_title) {
          setTitle(settings.category_section_title);
        }
        if (settings.category_section_cta_label) {
          setCtaLabel(settings.category_section_cta_label);
        }

        if (categoriesResponse.data?.length) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load category section content', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedCategories = useMemo(
    () => categories.slice().sort((a, b) => a.display_order - b.display_order),
    [categories],
  );

  const resolveIcon = (iconName: string): LucideIcon => ICON_MAP[iconName] ?? BookOpen;

  return (
    <section className="py-12 bg-white">
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
            {ctaLabel}
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {sortedCategories.map((category, index) => {
            const Icon = resolveIcon(category.icon_name);
            return (
              <motion.div
                key={category.id}
                className="bg-[#FAF7FF] rounded-lg p-6 cursor-pointer group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 group-hover:bg-[#884be3] transition-colors"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="text-[#6B4BA8] group-hover:text-white transition-colors" size={24} />
                </motion.div>
                <h3 className="font-semibold text-[#2D1B4E] mb-1">{category.name}</h3>
                <p className="text-sm text-[#6B4BA8]">
                  {category.book_count.toLocaleString('bn-BD')} টি বই
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
