import { Suspense } from 'react';
import HomePageClient from '@/components/home/HomePageClient';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#884be3] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}
