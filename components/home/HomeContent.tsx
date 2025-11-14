'use client';

import BookSection from '../BookSection';
import CategorySection from '../CategorySection';
import Services from '../Services';
import type {
  CategorySectionContent,
  HomeCopyContent,
  HomeSectionsContent,
  ServicesSectionContent,
} from '@/lib/page-data';

interface HomeContentProps {
  onBookClick: (bookId: string) => void;
  sections: HomeSectionsContent;
  copy: HomeCopyContent;
  categorySection: CategorySectionContent;
  servicesSection: ServicesSectionContent;
}

export default function HomeContent({
  onBookClick,
  sections,
  copy,
  categorySection,
  servicesSection,
}: HomeContentProps) {
  return (
    <>
      {sections.recommended.length > 0 && (
        <BookSection
          title={copy.recommendedTitle}
          books={sections.recommended}
          onBookClick={onBookClick}
          filterType="recommended"
        />
      )}
      {sections.recent.length > 0 && (
        <BookSection
          title={copy.recentTitle}
          books={sections.recent}
          onBookClick={onBookClick}
          filterType="recent"
        />
      )}
      <CategorySection
        title={categorySection.title}
        ctaLabel={categorySection.ctaLabel}
        categories={categorySection.categories}
      />

      {sections.popular.length > 0 && (
        <BookSection
          title={copy.popularTitle}
          books={sections.popular}
          onBookClick={onBookClick}
          filterType="popular"
        />
      )}

      {sections.bestsellers.length > 0 && (
        <BookSection
          title={copy.bestsellerTitle}
          books={sections.bestsellers}
          onBookClick={onBookClick}
          filterType="bestseller"
        />
      )}

      <Services
        title={servicesSection.title}
        ctaLabel={servicesSection.ctaLabel}
        services={servicesSection.services}
      />
    </>
  );
}
