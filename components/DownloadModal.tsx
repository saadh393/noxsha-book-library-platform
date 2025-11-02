'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, User, Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { createDownload, requestBookDownload } from '@/lib/api';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookId: string;
}

export default function DownloadModal({ isOpen, onClose, bookTitle, bookId }: DownloadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createDownload({
        bookId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });

      try {
        const { downloadUrl } = await requestBookDownload(bookId);
        window.open(downloadUrl, '_blank', 'noopener');
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          setFormData({ name: '', email: '', phone: '', address: '' });
        }, 2000);
      } catch (err) {
        console.error('Failed to retrieve PDF download link', err);
        setErrorMessage('ডাউনলোড লিংক প্রস্তুত করতে পারিনি। পরে আবার চেষ্টা করুন।');
      }
    } catch (error) {
      console.error('Failed to save download request', error);
      setErrorMessage('ডাউনলোড রেজিস্ট্রেশন সম্পন্ন করা যায়নি');
    } finally {
      setIsSubmitting(false);
    }

  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {!isSuccess ? (
                <>
                  <div className="sticky top-0 bg-gradient-to-r from-[#884be3] to-[#6B4BA8] text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold">ই-বুক ডাউনলোড করুন</h2>
                      <motion.button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={24} />
                      </motion.button>
                    </div>
                    <p className="text-white/90 text-sm">{bookTitle}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMessage && (
                      <motion.div
                        className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errorMessage}
                      </motion.div>
                    )}
                    <p className="text-gray-600 text-sm mb-6">
                      বিনামূল্যের এই ই-বুকটি ডাউনলোড করতে আপনার তথ্য প্রদান করুন। আপনার গোপনীয়তা আমরা সম্মান করি এবং কোনো তথ্য শেয়ার করা হয় না।
                    </p>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="inline mr-2" size={16} />
                        পূর্ণ নাম *
                      </label>
                      <motion.input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="inline mr-2" size={16} />
                        ইমেল ঠিকানা *
                      </label>
                      <motion.input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                        placeholder="your.email@example.com"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="inline mr-2" size={16} />
                        ফোন নম্বর *
                      </label>
                      <motion.input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                        placeholder="+৮৮ ০১XXXXXXXXX"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <MapPin className="inline mr-2" size={16} />
                        ঠিকানা *
                      </label>
                      <motion.textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors resize-none"
                        placeholder="আপনার পূর্ণ ঠিকানা লিখুন"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#884be3] to-[#6B4BA8] text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <>
                          <Download size={20} />
                          এখনই ডাউনলোড করুন
                        </>
                      )}
                    </motion.button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-12 text-center"
                >
                  <motion.div
                    className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    <motion.svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <motion.path d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">সফল হয়েছে!</h3>
                  <p className="text-gray-600">অল্পক্ষণ পরেই ডাউনলোড শুরু হবে...</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
