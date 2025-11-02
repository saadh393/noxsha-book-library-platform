"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, X, Lock } from "lucide-react";
import { fetchNavLinks, fetchSiteSettings } from "@/lib/api";
import type { NavLink } from "@/lib/types";

interface HeaderProps {
    initialSearchQuery?: string;
    onSearch: (query: string) => void;
    onAdminClick?: () => void;
}

const MotionLink = motion(Link);

export default function Header({
    initialSearchQuery,
    onSearch,
    onAdminClick,
}: HeaderProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? "");
    const [logoText, setLogoText] = useState("নোকশা");
    const [searchPlaceholder, setSearchPlaceholder] = useState(
        "শিরোনাম বা লেখক অনুসারে বই খুঁজুন..."
    );
    const [adminTooltip, setAdminTooltip] = useState("অ্যাডমিন প্যানেল");
    const [navItems, setNavItems] = useState<NavLink[]>([
        { id: "default-1", label: "প্রথম পাতা", href: "/", display_order: 0 },
        { id: "default-2", label: "ই-বুক", href: "#ebook", display_order: 1 },
        {
            id: "default-3",
            label: "আমাদের সম্পর্কে",
            href: "#about",
            display_order: 2,
        },
    ]);

    useEffect(() => {
        setSearchQuery(initialSearchQuery ?? "");
    }, [initialSearchQuery]);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const [settingsResponse, navResponse] = await Promise.all([
                    fetchSiteSettings([
                        "header_logo_text",
                        "header_search_placeholder",
                        "header_admin_tooltip",
                    ]),
                    fetchNavLinks(),
                ]);

                if (!isMounted) return;

                const settings = settingsResponse.data;
                if (settings.header_logo_text) {
                    setLogoText(settings.header_logo_text);
                }
                if (settings.header_search_placeholder) {
                    setSearchPlaceholder(settings.header_search_placeholder);
                }
                if (settings.header_admin_tooltip) {
                    setAdminTooltip(settings.header_admin_tooltip);
                }

                if (navResponse.data?.length) {
                    setNavItems(navResponse.data);
                }
            } catch (error) {
                console.error("Failed to load header content", error);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const clearSearch = () => {
        setSearchQuery("");
        onSearch("");
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
                            {logoText}
                        </span>
                    </MotionLink>

                    <nav className="hidden md:flex items-center gap-8">
                        {navItems
                            .slice()
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((item, index) => (
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
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-[#884be3]/10 rounded-full transition-colors"
                        >
                            <Search size={20} className="text-[#6B4BA8]" />
                        </motion.button>
                        {onAdminClick && (
                            <motion.button
                                onClick={onAdminClick}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 hover:bg-[#884be3]/10 rounded-full transition-colors"
                                title={adminTooltip}
                            >
                                <Lock size={20} className="text-[#6B4BA8]" />
                            </motion.button>
                        )}
                    </div>
                </div>

                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-4"
                    >
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    onSearch(e.target.value);
                                }}
                                placeholder={searchPlaceholder}
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
