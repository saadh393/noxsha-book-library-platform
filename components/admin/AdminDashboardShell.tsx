'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { adminLogout } from '@/lib/auth';
import AdminSidebar from './AdminSidebar';
import AdminBooksManager from './AdminBooksManager';
import AdminSettings from './AdminSettings';
import AdminReviews from './AdminReviews';
import AdminSocialLinks from './AdminSocialLinks';

type AdminPage = 'books' | 'categories' | 'hero' | 'reviews' | 'social' | 'contact';

interface AdminDashboardShellProps {
  onLogout: () => void;
}

export default function AdminDashboardShell({ onLogout }: AdminDashboardShellProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('books');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await adminLogout();
    onLogout();
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'books':
        return <AdminBooksManager />;
      case 'categories':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#2D1B4E]">বইয়ের বিভাগ</h2>
            <p className="text-[#6B4BA8] mt-4">বিভাগ ব্যবস্থাপনা খুব শীঘ্রই যুক্ত হবে...</p>
          </div>
        );
      case 'hero':
        return <AdminSettings />;
      case 'reviews':
        return <AdminReviews />;
      case 'social':
        return <AdminSocialLinks />;
      case 'contact':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#2D1B4E]">যোগাযোগ সেটিংস</h2>
            <p className="text-[#6B4BA8] mt-4">যোগাযোগ তথ্য ব্যবস্থাপনা খুব শীঘ্রই আসছে...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.header
          className="bg-white shadow-md px-6 py-4 flex items-center justify-between"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-[#2D1B4E] font-serif">নোকশা অ্যাডমিন</h1>
          </div>
          <motion.button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={18} />
            লগআউট
          </motion.button>
        </motion.header>

        <main className="flex-1 overflow-auto bg-gray-50">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
