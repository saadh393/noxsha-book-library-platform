'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Headphones,
  LucideIcon,
  Package,
  Shield,
  Truck,
} from 'lucide-react';
import { fetchHighlightServices, fetchSiteSettings } from '@/lib/api';
import type { HighlightService } from '@/lib/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  Shield,
  Headphones,
  Truck,
};

export default function Services() {
  const [title, setTitle] = useState('কেন আমাদের বেছে নেবেন');
  const [ctaLabel, setCtaLabel] = useState('সব দেখুন');
  const [services, setServices] = useState<HighlightService[]>([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [settingsResponse, servicesResponse] = await Promise.all([
          fetchSiteSettings(['services_section_title', 'services_section_cta_label']),
          fetchHighlightServices(),
        ]);

        if (!isMounted) return;

        const settings = settingsResponse.data;
        if (settings.services_section_title) {
          setTitle(settings.services_section_title);
        }
        if (settings.services_section_cta_label) {
          setCtaLabel(settings.services_section_cta_label);
        }

        if (servicesResponse.data?.length) {
          setServices(servicesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load services content', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedServices = useMemo(
    () => services.slice().sort((a, b) => a.display_order - b.display_order),
    [services],
  );

  const resolveIcon = (iconName: string): LucideIcon => ICON_MAP[iconName] ?? Package;

  return (
    <section id="about" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif text-[#2D1B4E]">{title}</h2>
          <motion.button
            className="flex items-center gap-2 text-[#6B4BA8] hover:text-[#884be3] transition-colors"
            whileHover={{ x: 5 }}
          >
            {ctaLabel}
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {sortedServices.map((service, index) => {
            const Icon = resolveIcon(service.icon_name);
            return (
              <motion.div
                key={service.id}
                className="bg-[#FAF7FF] rounded-lg p-6 text-center group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#884be3] transition-colors"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="text-[#6B4BA8] group-hover:text-white transition-colors" size={28} />
                </motion.div>
                <h3 className="font-semibold text-[#2D1B4E] mb-2">{service.title}</h3>
                <p className="text-sm text-[#6B4BA8]">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
