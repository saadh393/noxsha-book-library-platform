export const DEFAULT_BRAND_NAME = "নোকশা";

const LEGACY_BRAND_PATTERNS = [/নোকশা/g, /Noxsha/gi];

export function replaceLegacyBrandName(value: string, brandName: string) {
    const resolvedBrandName = brandName.trim() || DEFAULT_BRAND_NAME;

    return LEGACY_BRAND_PATTERNS.reduce(
        (text, pattern) => text.replace(pattern, resolvedBrandName),
        value
    );
}

export function buildCopyrightText(brandName: string) {
    return `স্বত্ব © ২০২৫ ${brandName.trim() || DEFAULT_BRAND_NAME}। সর্বস্বত্ব সংরক্ষিত।`;
}
