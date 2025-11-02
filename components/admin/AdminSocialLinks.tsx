'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Plus, X, Edit2, Save, Trash2 } from 'lucide-react';
import {
  createSocialLink as createSocialLinkRequest,
  deleteSocialLink as deleteSocialLinkRequest,
  fetchSocialLinks as fetchSocialLinksRequest,
  updateSocialLink as updateSocialLinkRequest
} from '@/lib/api';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name: string;
  is_active: boolean;
}

export default function AdminSocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ platform: '', url: '', icon_name: '' });

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      const { data } = await fetchSocialLinksRequest();
      setLinks(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'সোশ্যাল লিংক লোড করতে ব্যর্থ হয়েছি' });
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await updateSocialLinkRequest(id, { is_active: !isActive });
      setLinks(prev => prev.map(l => l.id === id ? { ...l, is_active: !isActive } : l));
      setMessage({ type: 'success', text: 'আপডেট সম্পূর্ণ!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'আপডেট করতে ব্যর্থ হয়েছি' });
    }
  }

  async function deleteLink(id: string) {
    try {
      await deleteSocialLinkRequest(id);
      setLinks(prev => prev.filter(l => l.id !== id));
      setMessage({ type: 'success', text: 'সফলভাবে মুছে ফেলা হয়েছে!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'মুছে ফেলতে ব্যর্থ হয়েছি' });
    }
  }

  async function saveLink() {
    if (!formData.platform || !formData.url || !formData.icon_name) {
      setMessage({ type: 'error', text: 'সব ঘর পূরণ করা আবশ্যক' });
      return;
    }

    try {
      if (editingId) {
        await updateSocialLinkRequest(editingId, formData);
        setLinks(prev => prev.map(l => l.id === editingId ? { ...l, ...formData } : l));
        setMessage({ type: 'success', text: 'আপডেট সম্পূর্ণ!' });
      } else {
        const { data } = await createSocialLinkRequest(formData);
        setLinks(prev => [...prev, data]);
        setMessage({ type: 'success', text: 'সফলভাবে যোগ হয়েছে!' });
      }

      setFormData({ platform: '', url: '', icon_name: '' });
      setEditingId(null);
      setIsAddingNew(false);
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'সংরক্ষণ করতে ব্যর্থ হয়েছি' });
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[#2D1B4E]">সোশ্যাল মিডিয়া লিংক</h2>
        <motion.button
          onClick={() => {
            setIsAddingNew(true);
            setEditingId(null);
            setFormData({ platform: '', url: '', icon_name: '' });
          }}
          className="bg-[#884be3] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#6B4BA8] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          নতুন লিংক যোগ করুন
        </motion.button>
      </div>

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

      {(isAddingNew || editingId) && (
        <motion.div
          className="bg-white rounded-lg shadow-md p-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-[#2D1B4E] mb-4">
            {editingId ? 'লিংক সম্পাদনা করুন' : 'নতুন লিংক যোগ করুন'}
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              placeholder="প্ল্যাটফর্মের নাম (যেমন, Facebook)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
            />
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="ইউআরএল (যেমন, https://facebook.com/...)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
            />
            <input
              type="text"
              value={formData.icon_name}
              onChange={(e) => setFormData(prev => ({ ...prev, icon_name: e.target.value }))}
              placeholder="আইকনের নাম (যেমন, Facebook, Instagram)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
            />
            <div className="flex gap-3">
              <motion.button
                onClick={saveLink}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save size={18} />
                সংরক্ষণ করুন
              </motion.button>
              <motion.button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingId(null);
                  setFormData({ platform: '', url: '', icon_name: '' });
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={18} />
                বাতিল
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {links.length > 0 ? (
          links.map((link, index) => (
            <motion.div
              key={link.id}
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2D1B4E]">{link.platform}</h3>
                  <p className="text-sm text-[#6B4BA8] truncate">{link.url}</p>
                  <p className="text-xs text-gray-500 mt-1">আইকন: {link.icon_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={link.is_active}
                      onChange={() => toggleActive(link.id, link.is_active)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm font-medium text-[#2D1B4E]">
                      {link.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </label>
                  <motion.button
                    onClick={() => {
                      setEditingId(link.id);
                      setFormData({
                        platform: link.platform,
                        url: link.url,
                        icon_name: link.icon_name
                      });
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit2 size={18} />
                  </motion.button>
                  <motion.button
                    onClick={() => deleteLink(link.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-[#6B4BA8]">কোনো সোশ্যাল লিংক পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
