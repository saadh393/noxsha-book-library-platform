'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  LucideIcon,
  Twitter,
  Youtube,
  Github,
} from 'lucide-react';
import { fetchActiveSocialLinks, fetchSiteSettings } from '@/lib/api';
import type { SocialLink } from '@/lib/types';

interface FooterLinkItem {
  label: string;
  href?: string;
}

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Github,
};

export default function Footer() {
  const [companyName, setCompanyName] = useState('নোকশা');
  const [description, setDescription] = useState(
    'বাছাইকৃত ই-বুকের বিনামূল্যের সংগ্রহশালা। জ্ঞান অন্বেষণে কোনো সীমানা নেই।',
  );
  const [quickLinks, setQuickLinks] = useState<FooterLinkItem[]>([]);
  const [contactLinks, setContactLinks] = useState<FooterLinkItem[]>([]);
  const [bottomText, setBottomText] = useState('স্বত্ব © ২০২৫ নোকশা। সর্বস্বত্ব সংরক্ষিত।');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [settingsResponse, socialResponse] = await Promise.all([
          fetchSiteSettings([
            'footer_company_name',
            'footer_description',
            'footer_quick_links',
            'footer_contact_links',
            'footer_bottom_text',
          ]),
          fetchActiveSocialLinks(),
        ]);

        if (!isMounted) return;

        const settings = settingsResponse.data;
        if (settings.footer_company_name) {
          setCompanyName(settings.footer_company_name);
        }
        if (settings.footer_description) {
          setDescription(settings.footer_description);
        }
        if (settings.footer_quick_links) {
          try {
            const parsed = JSON.parse(settings.footer_quick_links) as FooterLinkItem[];
            if (Array.isArray(parsed)) {
              setQuickLinks(parsed);
            }
          } catch (error) {
            console.warn('Failed to parse footer_quick_links', error);
          }
        }
        if (settings.footer_contact_links) {
          try {
            const parsed = JSON.parse(settings.footer_contact_links) as FooterLinkItem[];
            if (Array.isArray(parsed)) {
              setContactLinks(parsed);
            }
          } catch (error) {
            console.warn('Failed to parse footer_contact_links', error);
          }
        }
        if (settings.footer_bottom_text) {
          setBottomText(settings.footer_bottom_text);
        }

        if (socialResponse.data?.length) {
          setSocialLinks(socialResponse.data.filter((link) => link.is_active));
        }
      } catch (error) {
        console.error('Failed to load footer content', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const socialIcon = (iconName: string): LucideIcon => SOCIAL_ICON_MAP[iconName] ?? Globe;

  const normalizedQuickLinks = useMemo(() => quickLinks.filter((item) => item.label?.length), [quickLinks]);
  const normalizedContactLinks = useMemo(
    () => contactLinks.filter((item) => item.label?.length),
    [contactLinks],
  );

  return (
    <footer className="bg-[#FAF7FF] border-t border-[#884be3]/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-serif text-[#884be3] mb-4 font-bold">{companyName}</h3>
            <p className="text-[#6B4BA8] text-sm mb-4">{description}</p>
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const Icon = socialIcon(link.icon_name);
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-[#884be3] group transition-colors"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon size={16} className="text-[#6B4BA8] group-hover:text-white transition-colors" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {[{ title: 'দ্রুত লিংক', items: normalizedQuickLinks }, { title: 'যোগাযোগ করুন', items: normalizedContactLinks }].map(
            (section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-semibold text-[#2D1B4E] mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.items.map((link) => (
                    <motion.li key={link.label} whileHover={{ x: 5 }}>
                      <a
                        href={link.href ?? '#'}
                        className="text-sm text-[#6B4BA8] hover:text-[#884be3] transition-colors"
                      >
                        {link.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ),
          )}
        </div>

        <motion.div
          className="mt-8 pt-8 border-t border-[#884be3]/20 text-center text-sm text-[#6B4BA8]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {bottomText}
        </motion.div>
      </div>
    </footer>
  );
}
