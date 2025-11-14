'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { NavLink } from '@/lib/types';

type SearchMode = 'inline' | 'dialog';

interface HeaderProps {
  initialSearchQuery?: string;
  onSearch?: (query: string) => void;
  onAdminClick?: () => void;
  logoText?: string;
  searchPlaceholder?: string;
  adminTooltip?: string;
  navItems?: NavLink[];
  searchMode?: SearchMode;
  onSearchToggle?: () => void;
}

const MotionLink = motion(Link);

export default function Header({
  initialSearchQuery,
  onSearch,
  onAdminClick,
  logoText,
  searchPlaceholder,
  adminTooltip,
  navItems,
  searchMode = 'inline',
  onSearchToggle,
}: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? '');
  const isDialogMode = searchMode === 'dialog';

  useEffect(() => {
    setSearchQuery(initialSearchQuery ?? '');
  }, [initialSearchQuery]);

  const resolvedLogoText = logoText ?? 'নোকশা';
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? 'শিরোনাম বা লেখক অনুসারে বই খুঁজুন...';
  const resolvedAdminTooltip = adminTooltip ?? 'অ্যাডমিন প্যানেল';
  const sortedNavItems = useMemo(
    () => (navItems ?? []).slice().sort((a, b) => a.display_order - b.display_order),
    [navItems],
  );

  const handleSearchButtonClick = () => {
    if (isDialogMode) {
      onSearchToggle?.();
    } else {
      setIsSearchOpen((prev) => !prev);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-[#FAF7FF] border-b border-[#884be3]/20"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <MotionLink
            href="/"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl font-serif text-[#884be3] font-bold">
              <Image src="/logo.png" height={80} width={100} alt={resolvedLogoText} />
            </span>
          </MotionLink>

          <nav className="hidden md:flex items-center gap-8">
            {sortedNavItems.map((item, index) => (
              <MotionLink
                key={`${item.id}-${item.label}`}
                href={item.href}
                className="text-sm text-[#6B4BA8] hover:text-[#884be3] transition-colors font-medium"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {item.label}
              </MotionLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleSearchButtonClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-[#884be3]/10 rounded-full transition-colors"
            >
              <Search size={20} className="text-[#6B4BA8]" />
            </motion.button>
            {/* {onAdminClick && (
              <motion.button
                onClick={onAdminClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#884be3]/10 rounded-full transition-colors"
                title={resolvedAdminTooltip}
              >
                <Lock size={20} className="text-[#6B4BA8]" />
              </motion.button>
            )} */}
          </div>
        </div>

        {!isDialogMode && isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4"
          >
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => handleChange(event.target.value)}
                placeholder={resolvedSearchPlaceholder}
                className="w-full px-4 py-3 pr-20 rounded-lg border-2 border-[#884be3]/20 focus:border-[#884be3] outline-none transition-colors bg-white"
                autoFocus
              />
              {searchQuery && (
                <motion.button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} className="text-gray-400" />
                </motion.button>
              )}
              <motion.button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#884be3] text-white rounded-lg hover:bg-[#6B4BA8]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search size={18} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
