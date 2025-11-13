import HomePageClient from "@/components/home/HomePageClient";
import { getHeroContent } from "@/lib/site-content";
import {
    getCategorySectionContent,
    getFooterContent,
    getHeaderContent,
    getHomeCopyContent,
    getHomeSectionsContent,
    getServicesSectionContent,
    searchBooksByQuery,
} from "@/lib/page-data.server";

type HomePageProps = {
    searchParams?: { search?: string };
};

export default async function HomePage({ searchParams }: HomePageProps) {
    const searchParamValue =
        typeof searchParams?.search === "string" ? searchParams.search : "";
    const searchQuery = searchParamValue.trim();

    const [
        heroContent,
        headerContent,
        footerContent,
        sections,
        copy,
        categorySection,
        servicesSection,
        initialSearchResults,
    ] = await Promise.all([
        getHeroContent(),
        getHeaderContent(),
        getFooterContent(),
        getHomeSectionsContent(),
        getHomeCopyContent(),
        getCategorySectionContent(),
        getServicesSectionContent(),
        searchQuery ? searchBooksByQuery(searchQuery) : Promise.resolve([]),
    ]);

    return (
        <HomePageClient
            heroContent={heroContent}
            headerContent={headerContent}
            footerContent={footerContent}
            sections={sections}
            copy={copy}
            categorySection={categorySection}
            servicesSection={servicesSection}
            initialSearchQuery={searchQuery}
            initialSearchResults={initialSearchResults}
            hasServerSearchResults={Boolean(searchQuery)}
        />
    );
}
