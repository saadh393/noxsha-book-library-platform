'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ImagePlus, Save, Trash2, Upload } from 'lucide-react';
import { fetchSiteSettings, updateSiteSettings, uploadToStorage } from '@/lib/api';
import { buildCopyrightText, DEFAULT_BRAND_NAME } from '@/lib/branding';
import { BRAND_IMAGE_VARIANTS, buildStorageImageUrl } from '@/lib/storage';

interface BrandingSettings {
  brandName: string;
  logoStorageName: string;
}

const BRANDING_SETTING_KEYS = [
  'header_logo_text',
  'footer_company_name',
  'header_logo_image_storage_name',
] as const;

export default function AdminBranding() {
  const [settings, setSettings] = useState<BrandingSettings>({
    brandName: '',
    logoStorageName: '',
  });
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    void loadBrandingSettings();
  }, []);

  async function loadBrandingSettings() {
    try {
      const { data } = await fetchSiteSettings([...BRANDING_SETTING_KEYS]);
      const brandName = data.header_logo_text ?? data.footer_company_name ?? '';
      const logoStorageName = data.header_logo_image_storage_name ?? '';

      setSettings({
        brandName,
        logoStorageName,
      });
      setLogoPreviewUrl(
        buildStorageImageUrl(
          logoStorageName || null,
          BRAND_IMAGE_VARIANTS.adminPreview,
        ),
      );
    } catch (error) {
      console.error('Failed to load branding settings', error);
      setMessage({ type: 'error', text: 'ব্র্যান্ডিং সেটিংস লোড করা যায়নি।' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogoUpload(file: File) {
    setIsUploading(true);
    setMessage(null);

    try {
      const response = await uploadToStorage(file, 'image');
      const storageName = response.data.storage_name ?? '';
      const previewUrl =
        buildStorageImageUrl(storageName, BRAND_IMAGE_VARIANTS.adminPreview) ??
        response.data.url ??
        null;

      setSettings((current) => ({
        ...current,
        logoStorageName: storageName,
      }));
      setLogoPreviewUrl(previewUrl);
      setMessage({ type: 'success', text: 'লোগো আপলোড হয়েছে। এখন সংরক্ষণ করুন।' });
    } catch (error) {
      console.error('Failed to upload logo', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'লোগো আপলোড করা যায়নি।',
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateSiteSettings({
        header_logo_text: settings.brandName.trim(),
        footer_company_name: settings.brandName.trim(),
        footer_bottom_text: buildCopyrightText(settings.brandName.trim()),
        header_logo_image_storage_name: settings.logoStorageName.trim(),
      });
      setMessage({ type: 'success', text: 'লোগো ও নাম সফলভাবে সংরক্ষিত হয়েছে।' });
    } catch (error) {
      console.error('Failed to save branding settings', error);
      setMessage({ type: 'error', text: 'ব্র্যান্ডিং সেটিংস সংরক্ষণ করা যায়নি।' });
    } finally {
      setIsSaving(false);
    }
  }

  const handleLogoRemove = () => {
    setSettings((current) => ({
      ...current,
      logoStorageName: '',
    }));
    setLogoPreviewUrl(null);
    setMessage({ type: 'success', text: 'লোগো মুছে ফেলা হয়েছে। এখন সংরক্ষণ করুন।' });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 rounded-2xl bg-gray-200" />
          <div className="h-40 rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#2D1B4E]">লোগো ও নাম</h2>
        <p className="mt-2 text-[#6B4BA8]">
          এখান থেকে ওয়েবসাইটের ব্র্যান্ড নাম এবং হেডার লোগো আপডেট করুন।
        </p>
      </div>

      {message && (
        <motion.div
          className={`mb-6 flex items-center gap-3 rounded-xl p-4 ${
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p>{message.text}</p>
        </motion.div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          className="rounded-2xl bg-white p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-[#2D1B4E]">ব্র্যান্ড নাম</h3>
          <p className="mt-2 text-sm text-[#6B4BA8]">
            এই নামটি হেডার এবং ফুটার দু’জায়গাতেই ব্যবহার হবে।
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-[#2D1B4E]">
              ওয়েবসাইটের নাম
            </label>
            <input
              type="text"
              value={settings.brandName}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  brandName: event.target.value,
                }))
              }
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 outline-none transition-colors focus:border-[#884be3]"
              placeholder={DEFAULT_BRAND_NAME}
            />
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl bg-white p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#2D1B4E]">লোগো</h3>
              <p className="mt-2 text-sm text-[#6B4BA8]">
                PNG, JPG বা WebP ফাইল আপলোড করুন।
              </p>
            </div>
            <span className="rounded-full bg-[#FAF7FF] px-3 py-1 text-xs font-semibold text-[#884be3]">
              Header
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-[#D8C8F3] bg-[#FAF7FF] p-5">
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-white px-4">
              {logoPreviewUrl ? (
                <div className="relative h-28 w-full max-w-[260px]">
                  <Image
                    src={logoPreviewUrl}
                    alt={settings.brandName || 'Logo preview'}
                    fill
                    sizes="260px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-center text-[#6B4BA8]">
                  <ImagePlus className="mx-auto mb-3" size={28} />
                  <p className="text-sm">এখনও কোনো কাস্টম লোগো যোগ করা হয়নি</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#884be3] to-[#6B4BA8] px-4 py-3 font-semibold text-white transition-opacity hover:opacity-95">
                <Upload size={18} />
                {isUploading ? 'আপলোড হচ্ছে...' : 'লোগো আপলোড করুন'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleLogoUpload(file);
                    }
                    event.currentTarget.value = '';
                  }}
                />
              </label>

              <button
                type="button"
                onClick={handleLogoRemove}
                disabled={!settings.logoStorageName}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E7DDF8] px-4 py-3 font-semibold text-[#6B4BA8] transition-colors hover:bg-[#FAF7FF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} />
                লোগো মুছুন
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={handleSave}
        disabled={isSaving || isUploading}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#884be3] to-[#6B4BA8] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Save size={18} />
        {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
      </motion.button>
    </div>
  );
}
