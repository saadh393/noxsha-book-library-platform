import { Suspense } from "react";
import HomePageClient from "@/components/home/HomePageClient";
import { getHeroContent } from "@/lib/site-content";
import {
    getCategorySectionContent,
    getFooterContent,
    getHeaderContent,
    getHomeCopyContent,
    getHomeSectionsContent,
    getServicesSectionContent,
} from "@/lib/page-data.server";

export default async function HomePage() {
    const [
        heroContent,
        headerContent,
        footerContent,
        sections,
        copy,
        categorySection,
        servicesSection,
    ] = await Promise.all([
        getHeroContent(),
        getHeaderContent(),
        getFooterContent(),
        getHomeSectionsContent(),
        getHomeCopyContent(),
        getCategorySectionContent(),
        getServicesSectionContent(),
    ]);

    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#884be3] border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <HomePageClient
                heroContent={heroContent}
                headerContent={headerContent}
                footerContent={footerContent}
                sections={sections}
                copy={copy}
                categorySection={categorySection}
                servicesSection={servicesSection}
            />
        </Suspense>
    );
}
