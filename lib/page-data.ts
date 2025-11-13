import type {
    Book,
    Category,
    HighlightService,
    NavLink,
    SocialLink,
} from "./types";

export interface HeaderContent {
    logoText: string;
    searchPlaceholder: string;
    adminTooltip: string;
    navItems: NavLink[];
}

export interface FooterLinkItem {
    label: string;
    href?: string;
}

export interface FooterContent {
    companyName: string;
    description: string;
    quickLinks: FooterLinkItem[];
    contactLinks: FooterLinkItem[];
    bottomText: string;
    socialLinks: SocialLink[];
}

export interface CategorySectionContent {
    title: string;
    ctaLabel: string;
    categories: Category[];
}

export interface ServicesSectionContent {
    title: string;
    ctaLabel: string;
    services: HighlightService[];
}

export interface HomeSectionsContent {
    recommended: Book[];
    recent: Book[];
    bestsellers: Book[];
    popular: Book[];
}

export interface HomeCopyContent {
    searchTitle: string;
    searchEmptyTitle: string;
    searchEmptyDescription: string;
    searchMetaSuffix: string;
    recommendedTitle: string;
    recentTitle: string;
    bestsellerTitle: string;
    popularTitle: string;
}
