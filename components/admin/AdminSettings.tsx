'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchSiteSettings, updateSiteSettings } from '@/lib/api';

interface Settings {
  hero_title: string;
  hero_subtitle: string;
  footer_description: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    hero_title: '',
    hero_subtitle: '',
    footer_description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const keys = ['hero_title', 'hero_subtitle', 'footer_description'];
      const { data } = await fetchSiteSettings(keys);
      setSettings({
        hero_title: data.hero_title ?? '',
        hero_subtitle: data.hero_subtitle ?? '',
        footer_description: data.footer_description ?? ''
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'সেটিংস লোড করতে ব্যর্থ হয়েছি' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const payload: Record<string, string> = { ...settings };
      await updateSiteSettings(payload);
      setMessage({ type: 'success', text: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'সেটিংস সংরক্ষণ করা যায়নি' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-[#2D1B4E] mb-8">হিরো সেকশন ও সেটিংস</h2>

      {message && (
        <motion.div
          className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 border-l-4 border-green-500'
              : 'bg-red-50 border-l-4 border-red-500'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message.type === 'success' ? (
            <CheckCircle className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-red-500" size={20} />
          )}
          <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </p>
        </motion.div>
      )}

      <div className="grid gap-6 max-w-4xl">
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-[#2D1B4E] mb-4">হিরো শিরোনাম</h3>
          <input
            type="text"
            value={settings.hero_title}
            onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
            placeholder="হিরো শিরোনাম লিখুন"
          />
          <p className="text-xs text-gray-500 mt-2">হোম পেইজের প্রধান শিরোনাম</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-[#2D1B4E] mb-4">হিরো উপশিরোনাম</h3>
          <textarea
            value={settings.hero_subtitle}
            onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors resize-none"
            placeholder="হিরো উপশিরোনাম লিখুন"
          />
          <p className="text-xs text-gray-500 mt-2">প্রধান শিরোনামের নিচে প্রদর্শিত উপশিরোনাম</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-[#2D1B4E] mb-4">ফুটার বর্ণনা</h3>
          <textarea
            value={settings.footer_description}
            onChange={(e) => setSettings(prev => ({ ...prev, footer_description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors resize-none"
            placeholder="ফুটারের বর্ণনা লিখুন"
          />
          <p className="text-xs text-gray-500 mt-2">ফুটারে প্রদর্শিত প্রতিষ্ঠান সম্পর্কিত বিবরণ</p>
        </motion.div>

        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#884be3] to-[#6B4BA8] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save size={20} />
          {isSaving ? 'সংরক্ষণ চলছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
        </motion.button>
      </div>
    </div>
  );
}
