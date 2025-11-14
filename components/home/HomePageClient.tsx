"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeContent from "@/components/home/HomeContent";
import SearchOverlay from "@/components/SearchOverlay";
import type { HeroContent } from "@/lib/site-content";
import type {
    CategorySectionContent,
    FooterContent,
    HeaderContent,
    HomeCopyContent,
    HomeSectionsContent,
    ServicesSectionContent,
} from "@/lib/page-data";

interface HomePageClientProps {
    heroContent: HeroContent;
    headerContent: HeaderContent;
    footerContent: FooterContent;
    sections: HomeSectionsContent;
    copy: HomeCopyContent;
    categorySection: CategorySectionContent;
    servicesSection: ServicesSectionContent;
}

export default function HomePageClient({
    heroContent,
    headerContent,
    footerContent,
    sections,
    copy,
    categorySection,
    servicesSection,
}: HomePageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchParamValue = searchParams.get("search") ?? "";
    const [searchQuery, setSearchQuery] = useState(searchParamValue);
    const [isSearchOpen, setIsSearchOpen] = useState(
        Boolean(searchParamValue)
    );

    useEffect(() => {
        setSearchQuery(searchParamValue);
        setIsSearchOpen(Boolean(searchParamValue));
    }, [searchParamValue]);

    const updateSearchParam = (query: string) => {
        const nextPath = query ? `/?search=${encodeURIComponent(query)}` : "/";
        router.replace(nextPath, { scroll: false });
    };

    const handleSearchToggle = () => {
        setIsSearchOpen(true);
    };

    const handleSearchClose = () => {
        setIsSearchOpen(false);
        if (searchQuery) {
            setSearchQuery("");
            updateSearchParam("");
        }
    };

    const handleSearchQueryChange = (query: string) => {
        setSearchQuery(query);
        updateSearchParam(query);
    };

    const handleBookNavigate = (bookId: string) => {
        router.push(`/books/${bookId}`);
    };

    return (
        <>
            <Header
                onAdminClick={() => router.push("/admin/login")}
                logoText={headerContent.logoText}
                searchPlaceholder={headerContent.searchPlaceholder}
                adminTooltip={headerContent.adminTooltip}
                navItems={headerContent.navItems}
                searchMode="dialog"
                onSearchToggle={handleSearchToggle}
            />
            <main>
                <Hero {...heroContent} />
                <HomeContent
                    onBookClick={handleBookNavigate}
                    sections={sections}
                    copy={copy}
                    categorySection={categorySection}
                    servicesSection={servicesSection}
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
            <SearchOverlay
                isOpen={isSearchOpen}
                query={searchQuery}
                copy={copy}
                onQueryChange={handleSearchQueryChange}
                onClose={handleSearchClose}
                onBookClick={(bookId) => {
                    setIsSearchOpen(false);
                    handleBookNavigate(bookId);
                }}
            />
        </>
    );
}
