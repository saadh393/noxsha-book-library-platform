import { cache } from "react";
import { getCollection } from "./db";
import {
    serializeBook,
    serializeCategory,
    serializeHighlightService,
    serializeNavLink,
    serializeSocialLink,
} from "./serializers";
import type {
    BookDocument,
    CategoryDocument,
    HighlightServiceDocument,
    NavLinkDocument,
    SiteSettingDocument,
    SocialLinkDocument,
} from "./types";
import type {
    CategorySectionContent,
    FooterContent,
    FooterLinkItem,
    HeaderContent,
    HomeCopyContent,
    HomeSectionsContent,
    ServicesSectionContent,
} from "./page-data";

const DEFAULT_HEADER_CONTENT: HeaderContent = {
    logoText: "নোকশা",
    searchPlaceholder: "শিরোনাম বা লেখক অনুসারে বই খুঁজুন...",
    adminTooltip: "অ্যাডমিন প্যানেল",
    navItems: [],
};

const DEFAULT_FOOTER_CONTENT: FooterContent = {
    companyName: "নোকশা",
    description:
        "বাছাইকৃত ই-বুকের বিনামূল্যের সংগ্রহশালা। জ্ঞান অন্বেষণে কোনো সীমানা নেই।",
    quickLinks: [],
    contactLinks: [],
    bottomText: "স্বত্ব © ২০২৫ নোকশা। সর্বস্বত্ব সংরক্ষিত।",
    socialLinks: [],
};

const DEFAULT_CATEGORY_SECTION: CategorySectionContent = {
    title: "ক্যাটেগরি",
    ctaLabel: "সব দেখুন",
    categories: [],
};

const DEFAULT_SERVICES_SECTION: ServicesSectionContent = {
    title: "কেন আমাদের বেছে নেবেন",
    ctaLabel: "সব দেখুন",
    services: [],
};

const DEFAULT_HOME_COPY: HomeCopyContent = {
    searchTitle: "অনুসন্ধানের ফলাফল",
    searchEmptyTitle: "কোনো বই পাওয়া যায়নি",
    searchEmptyDescription: "ভিন্ন কীওয়ার্ড দিয়ে আবার অনুসন্ধান করুন",
    searchMetaSuffix: "টি বই পাওয়া গেছে",
    recommendedTitle: "আপনার জন্য প্রস্তাবিত",
    recentTitle: "সাম্প্রতিক সংযোজন",
    bestsellerTitle: "সবচেয়ে জনপ্রিয়",
    popularTitle: "এই মাসের জনপ্রিয়",
};

const HEADER_SETTING_KEYS = [
    "header_logo_text",
    "header_search_placeholder",
    "header_admin_tooltip",
] as const;

const FOOTER_SETTING_KEYS = [
    "footer_company_name",
    "footer_description",
    "footer_quick_links",
    "footer_contact_links",
    "footer_bottom_text",
] as const;

const CATEGORY_SETTING_KEYS = [
    "category_section_title",
    "category_section_cta_label",
] as const;

const SERVICES_SETTING_KEYS = [
    "services_section_title",
    "services_section_cta_label",
] as const;

const HOME_COPY_SETTING_KEYS = [
    "home_search_title",
    "home_search_empty_title",
    "home_search_empty_description",
    "home_search_result_meta",
    "home_section_recommended_title",
    "home_section_recent_title",
    "home_section_bestseller_title",
    "home_section_popular_title",
] as const;

async function getSiteSettingsMap(
    keys: readonly string[]
): Promise<Record<string, string>> {
    if (!keys.length) {
        return {};
    }

    const collection =
        await getCollection<SiteSettingDocument>("site_settings");
    const records = await collection
        .find({ key: { $in: keys as unknown as string[] } })
        .toArray();

    return records.reduce<Record<string, string>>((acc, record) => {
        if (typeof record.value === "string") {
            acc[record.key] = record.value;
        }
        return acc;
    }, {});
}

function normalizeSetting(
    value: string | undefined,
    fallback: string
): string {
    return value?.trim().length ? value.trim() : fallback;
}

function parseFooterLinks(value?: string): FooterLinkItem[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value) as FooterLinkItem[];
        if (Array.isArray(parsed)) {
            return parsed
                .filter((item) => item?.label?.trim())
                .map((item) => ({
                    label: item.label.trim(),
                    href: item.href?.trim() || undefined,
                }));
        }
    } catch (error) {
        console.warn("Failed to parse footer links", error);
    }
    return [];
}

export const getHeaderContent = cache(async (): Promise<HeaderContent> => {
    const [settingsMap, navRecords] = await Promise.all([
        getSiteSettingsMap(HEADER_SETTING_KEYS),
        getCollection<NavLinkDocument>("nav_links").then((collection) =>
            collection
                .find(
                    {},
                    { sort: { display_order: 1, created_at: 1 }, limit: 50 }
                )
                .toArray()
        ),
    ]);

    const navItems = navRecords
        .map((record) => serializeNavLink(record))
        .sort((a, b) => a.display_order - b.display_order);

    return {
        logoText: normalizeSetting(
            settingsMap.header_logo_text,
            DEFAULT_HEADER_CONTENT.logoText
        ),
        searchPlaceholder: normalizeSetting(
            settingsMap.header_search_placeholder,
            DEFAULT_HEADER_CONTENT.searchPlaceholder
        ),
        adminTooltip: normalizeSetting(
            settingsMap.header_admin_tooltip,
            DEFAULT_HEADER_CONTENT.adminTooltip
        ),
        navItems,
    };
});

export const getFooterContent = cache(async (): Promise<FooterContent> => {
    const [settingsMap, socialRecords] = await Promise.all([
        getSiteSettingsMap(FOOTER_SETTING_KEYS),
        getCollection<SocialLinkDocument>("social_links").then((collection) =>
            collection.find({ is_active: true }).toArray()
        ),
    ]);

    const socialLinks = socialRecords
        .filter((record) => record.is_active)
        .map((record) => serializeSocialLink(record));

    return {
        companyName: normalizeSetting(
            settingsMap.footer_company_name,
            DEFAULT_FOOTER_CONTENT.companyName
        ),
        description: normalizeSetting(
            settingsMap.footer_description,
            DEFAULT_FOOTER_CONTENT.description
        ),
        quickLinks: parseFooterLinks(settingsMap.footer_quick_links),
        contactLinks: parseFooterLinks(settingsMap.footer_contact_links),
        bottomText: normalizeSetting(
            settingsMap.footer_bottom_text,
            DEFAULT_FOOTER_CONTENT.bottomText
        ),
        socialLinks,
    };
});

export const getCategorySectionContent = cache(
    async (): Promise<CategorySectionContent> => {
        const [settingsMap, categoryRecords] = await Promise.all([
            getSiteSettingsMap(CATEGORY_SETTING_KEYS),
            getCollection<CategoryDocument>("categories").then((collection) =>
                collection.find({}).toArray()
            ),
        ]);

        const categories = categoryRecords
            .map((record) => serializeCategory(record))
            .sort((a, b) => a.name.localeCompare(b.name, "bn"));

        return {
            title: normalizeSetting(
                settingsMap.category_section_title,
                DEFAULT_CATEGORY_SECTION.title
            ),
            ctaLabel: normalizeSetting(
                settingsMap.category_section_cta_label,
                DEFAULT_CATEGORY_SECTION.ctaLabel
            ),
            categories,
        };
    }
);

export const getServicesSectionContent = cache(
    async (): Promise<ServicesSectionContent> => {
        const [settingsMap, serviceRecords] = await Promise.all([
            getSiteSettingsMap(SERVICES_SETTING_KEYS),
            getCollection<HighlightServiceDocument>(
                "highlight_services"
            ).then((collection) =>
                collection.find({}, { sort: { display_order: 1 } }).toArray()
            ),
        ]);

        const services = serviceRecords
            .map((record) => serializeHighlightService(record))
            .sort((a, b) => a.display_order - b.display_order);

        return {
            title: normalizeSetting(
                settingsMap.services_section_title,
                DEFAULT_SERVICES_SECTION.title
            ),
            ctaLabel: normalizeSetting(
                settingsMap.services_section_cta_label,
                DEFAULT_SERVICES_SECTION.ctaLabel
            ),
            services,
        };
    }
);

export const getHomeCopyContent = cache(
    async (): Promise<HomeCopyContent> => {
        const settingsMap = await getSiteSettingsMap(HOME_COPY_SETTING_KEYS);
        return {
            searchTitle: normalizeSetting(
                settingsMap.home_search_title,
                DEFAULT_HOME_COPY.searchTitle
            ),
            searchEmptyTitle: normalizeSetting(
                settingsMap.home_search_empty_title,
                DEFAULT_HOME_COPY.searchEmptyTitle
            ),
            searchEmptyDescription: normalizeSetting(
                settingsMap.home_search_empty_description,
                DEFAULT_HOME_COPY.searchEmptyDescription
            ),
            searchMetaSuffix: normalizeSetting(
                settingsMap.home_search_result_meta,
                DEFAULT_HOME_COPY.searchMetaSuffix
            ),
            recommendedTitle: normalizeSetting(
                settingsMap.home_section_recommended_title,
                DEFAULT_HOME_COPY.recommendedTitle
            ),
            recentTitle: normalizeSetting(
                settingsMap.home_section_recent_title,
                DEFAULT_HOME_COPY.recentTitle
            ),
            bestsellerTitle: normalizeSetting(
                settingsMap.home_section_bestseller_title,
                DEFAULT_HOME_COPY.bestsellerTitle
            ),
            popularTitle: normalizeSetting(
                settingsMap.home_section_popular_title,
                DEFAULT_HOME_COPY.popularTitle
            ),
        };
    }
);

export const getHomeSectionsContent = cache(
    async (): Promise<HomeSectionsContent> => {
        const collection = await getCollection<BookDocument>("books");
        const [recommendedRows, recentRows, bestsellersRows, popularRows] =
            await Promise.all([
                collection
                    .find({})
                    .sort({
                        rating: -1,
                        sales_count: -1,
                        created_at: -1,
                    })
                    .limit(5)
                    .toArray(),
                collection
                    .find({})
                    .sort({ created_at: -1 })
                    .limit(5)
                    .toArray(),
                collection
                    .find({ is_bestseller: true })
                    .sort({ created_at: -1 })
                    .limit(4)
                    .toArray(),
                collection
                    .find({})
                    .sort({ sales_count: -1, rating: -1 })
                    .limit(4)
                    .toArray(),
            ]);

        return {
            recommended: recommendedRows.map((row) => serializeBook(row)),
            recent: recentRows.map((row) => serializeBook(row)),
            bestsellers: bestsellersRows.map((row) => serializeBook(row)),
            popular: popularRows.map((row) => serializeBook(row)),
        };
    }
);
