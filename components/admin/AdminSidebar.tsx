"use client";

import { motion } from "framer-motion";
import {
    BookOpen,
    Grid3x3,
    Type,
    MessageSquare,
    Share2,
    Download,
    Mail,
} from "lucide-react";

type AdminPage =
    | "books"
    | "categories"
    | "hero"
    | "reviews"
    | "social"
    | "downloads"
    | "contact";

interface AdminSidebarProps {
    currentPage: AdminPage;
    onPageChange: (page: AdminPage) => void;
    isOpen: boolean;
}

const menuItems: { label: string; icon: React.ReactNode; page: AdminPage }[] = [
    { label: "বই ব্যবস্থাপনা", icon: <BookOpen size={20} />, page: "books" },
    { label: "ক্যাটেগরি", icon: <Grid3x3 size={20} />, page: "categories" },
    { label: "হিরো সেকশন", icon: <Type size={20} />, page: "hero" },
    // { label: 'রিভিউ', icon: <MessageSquare size={20} />, page: 'reviews' },
    { label: "সোশ্যাল লিঙ্ক", icon: <Share2 size={20} />, page: "social" },
    {
        label: "ডাউনলোড রেকর্ড",
        icon: <Download size={20} />,
        page: "downloads",
    },
    { label: "যোগাযোগ তথ্য", icon: <Mail size={20} />, page: "contact" },
];

export default function AdminSidebar({
    currentPage,
    onPageChange,
    isOpen,
}: AdminSidebarProps) {
    return (
        <motion.aside
            className="bg-[#2D1B4E] text-white w-64 flex flex-col fixed md:static h-full z-40 md:z-auto"
            animate={{ x: isOpen ? 0 : -256 }}
            transition={{ duration: 0.3 }}
        >
            <div className="p-6">
                <h2 className="text-2xl font-bold font-serif">নোকশা</h2>
                <p className="text-[#884be3] text-sm mt-1">অ্যাডমিন প্যানেল</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item, index) => (
                    <motion.button
                        key={item.page}
                        onClick={() => {
                            onPageChange(item.page);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            currentPage === item.page
                                ? "bg-[#884be3] text-white"
                                : "text-gray-300 hover:bg-[#3D2B5E]"
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                    </motion.button>
                ))}
            </nav>

            <div className="px-4 py-6 border-t border-[#3D2B5E]">
                <p className="text-xs text-gray-400 text-center">
                    অ্যাডমিন ড্যাশবোর্ড সংস্করণ ১.০
                </p>
            </div>
        </motion.aside>
    );
}
