'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { adminLogin } from '@/lib/auth';

interface AdminLoginFormProps {
  onLoginSuccess: () => void;
}

export default function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { user, error } = await adminLogin(email, password);

    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }

    if (user) {
      setIsLoading(false);
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#884be3] to-[#6B4BA8] flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-[#2D1B4E] font-serif">নোকশা</h1>
          <p className="text-[#6B4BA8] mt-2">অ্যাডমিন ড্যাশবোর্ড</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">
              <Mail className="inline mr-2" size={16} />
              ইমেল ঠিকানা
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
              placeholder="admin@noxsha.com"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-[#2D1B4E] mb-2">
              <Lock className="inline mr-2" size={16} />
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
              placeholder="••••••••"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#884be3] to-[#6B4BA8] text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition-opacity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <motion.div
                className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              'প্রবেশ করুন'
            )}
          </motion.button>
        </form>

        <motion.div
          className="mt-6 text-center text-sm text-[#6B4BA8]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>পরীক্ষার জন্য ডেমো তথ্য ব্যবহার করুন</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
