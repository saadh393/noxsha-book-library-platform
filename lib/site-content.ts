import { cache } from 'react';
import { getCollection } from './db';
import type { SiteSettingDocument } from './types';

export interface HeroHighlight {
  author: string;
  label: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  buttonLabel: string;
  highlights: HeroHighlight[];
}

const DEFAULT_HIGHLIGHTS: HeroHighlight[] = [
  { author: 'James Clear', label: 'জেমস ক্লিয়ারের সর্বশেষ লেখা' },
  { author: 'Newsletter Vol', label: 'নিউজলেটার সংস্করণের নতুনতম দিশা' },
  { author: 'Robert Kiyosaki', label: 'রবার্ট কিয়োসাকির সর্বশেষ ভাবনা' },
  { author: 'Brian Tracy', label: 'ব্রায়ান ট্রেসির নতুন অনুপ্রেরণা' },
];

const DEFAULT_HERO_CONTENT: HeroContent = {
  title: 'আপনার পরবর্তী\nবইটি খুঁজে নিন',
  subtitle:
    'প্রতিটি পাতায় অপেক্ষা করছে নতুন অভিযাত্রা। নোকশা আপনাকে অনুপ্রেরণাময় ডিজিটাল গল্পের নির্বাচিত বাছাই এনে দেয়।',
  buttonLabel: 'এখনই ঘুরে দেখুন',
  highlights: DEFAULT_HIGHLIGHTS,
};

const HERO_KEYS = [
  'hero_title',
  'hero_subtitle',
  'hero_button_label',
  'hero_highlights',
] as const;

function parseHighlights(value: string | null | undefined): HeroHighlight[] {
  if (!value) {
    return DEFAULT_HIGHLIGHTS;
  }

  try {
    const parsed = JSON.parse(value) as HeroHighlight[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item.author === 'string' &&
            item.author.trim().length > 0 &&
            typeof item.label === 'string' &&
            item.label.trim().length > 0,
        )
        .map((item) => ({
          author: item.author.trim(),
          label: item.label.trim(),
        }));
    }
  } catch (error) {
    console.warn('Failed to parse hero highlights setting', error);
  }

  return DEFAULT_HIGHLIGHTS;
}

export const getHeroContent = cache(async (): Promise<HeroContent> => {
  try {
    const collection = await getCollection<SiteSettingDocument>('site_settings');
    const records = await collection
      .find({ key: { $in: HERO_KEYS as unknown as string[] } })
      .toArray();

    const map = new Map(records.map((item) => [item.key, item.value]));

    return {
      title: map.get('hero_title')?.trim() || DEFAULT_HERO_CONTENT.title,
      subtitle: map.get('hero_subtitle')?.trim() || DEFAULT_HERO_CONTENT.subtitle,
      buttonLabel: map.get('hero_button_label')?.trim() || DEFAULT_HERO_CONTENT.buttonLabel,
      highlights: parseHighlights(map.get('hero_highlights')),
    };
  } catch (error) {
    console.error('Failed to load hero content', error);
  }

  return DEFAULT_HERO_CONTENT;
});
