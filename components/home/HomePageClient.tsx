"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeContent from "@/components/home/HomeContent";
import type { HeroContent } from "@/lib/site-content";
import type {
    CategorySectionContent,
    FooterContent,
    HeaderContent,
    HomeCopyContent,
    HomeSectionsContent,
    ServicesSectionContent,
} from "@/lib/page-data";
import type { Book } from "@/lib/types";

interface HomePageClientProps {
    heroContent: HeroContent;
    headerContent: HeaderContent;
    footerContent: FooterContent;
    sections: HomeSectionsContent;
    copy: HomeCopyContent;
    categorySection: CategorySectionContent;
    servicesSection: ServicesSectionContent;
    initialSearchQuery: string;
    initialSearchResults: Book[];
    hasServerSearchResults: boolean;
}

export default function HomePageClient({
    heroContent,
    headerContent,
    footerContent,
    sections,
    copy,
    categorySection,
    servicesSection,
    initialSearchQuery,
    initialSearchResults,
    hasServerSearchResults,
}: HomePageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamValue = searchParams.get("search");
    const [searchQuery, setSearchQuery] = useState(
        searchParamValue ?? initialSearchQuery ?? ""
    );

    useEffect(() => {
        setSearchQuery(searchParamValue ?? "");
    }, [searchParamValue]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const nextPath = query ? `/?search=${encodeURIComponent(query)}` : "/";
        router.replace(nextPath, { scroll: false });
    };

    const handleBookClick = (bookId: string) => {
        router.push(`/books/${bookId}`);
    };

    const handleAdminNavigate = () => {
        router.push("/admin/login");
    };

    return (
        <>
            <Header
                initialSearchQuery={searchQuery}
                onSearch={handleSearch}
                onAdminClick={handleAdminNavigate}
                logoText={headerContent.logoText}
                searchPlaceholder={headerContent.searchPlaceholder}
                adminTooltip={headerContent.adminTooltip}
                navItems={headerContent.navItems}
            />
            <main>
                <Hero {...heroContent} />
                <HomeContent
                    onBookClick={handleBookClick}
                    searchQuery={searchQuery}
                    initialSearchQuery={initialSearchQuery}
                    sections={sections}
                    copy={copy}
                    categorySection={categorySection}
                    servicesSection={servicesSection}
                    initialSearchResults={initialSearchResults}
                    hasServerSearchResults={hasServerSearchResults}
                />
            </main>
            <Footer
                companyName={footerContent.companyName}
                description={footerContent.description}
                quickLinks={footerContent.quickLinks}
                contactLinks={footerContent.contactLinks}
                bottomText={footerContent.bottomText}
                socialLinks={footerContent.socialLinks}
            />
        </>
    );
}
