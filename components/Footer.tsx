"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SocialLink } from "@/lib/types";
import Image from "next/image";
import type { FooterLinkItem } from "@/lib/page-data";

function normalizeIconName(value: string) {
    if (!value) return "";
    const trimmed = value.trim();
    if (
        trimmed.includes("-") ||
        trimmed.includes("_") ||
        trimmed.includes(" ")
    ) {
        return trimmed
            .split(/[-_\s]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("");
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function resolveIcon(name: string): LucideIcon {
    const record = LucideIcons as Record<string, unknown>;
    const candidate = record[name];
    if (typeof candidate === "function") {
        return candidate as LucideIcon;
    }
    const fallback = record.Globe;
    return (
        typeof fallback === "function" ? fallback : () => null
    ) as LucideIcon;
}

interface FooterProps {
    companyName?: string;
    description?: string;
    quickLinks?: FooterLinkItem[];
    contactLinks?: FooterLinkItem[];
    bottomText?: string;
    socialLinks?: SocialLink[];
}

export default function Footer({
    companyName,
    description,
    quickLinks,
    contactLinks,
    bottomText,
    socialLinks,
}: FooterProps) {
    const resolvedCompanyName = companyName ?? "নোকশা";
    const resolvedDescription =
        description ??
        "বাছাইকৃত ই-বুকের বিনামূল্যের সংগ্রহশালা। জ্ঞান অন্বেষণে কোনো সীমানা নেই।";
    const resolvedBottomText =
        bottomText ?? "স্বত্ব © ২০২৫ নোকশা। সর্বস্বত্ব সংরক্ষিত।";
    const resolvedQuickLinks = quickLinks ?? [];
    const resolvedContactLinks = contactLinks ?? [];
    const resolvedSocialLinks = (socialLinks ?? []).filter(
        (link) => link.platform?.length && link.url?.length
    );

    const normalizedQuickLinks = useMemo(
        () =>
            resolvedQuickLinks.filter((item) => item.label?.trim?.().length),
        [resolvedQuickLinks]
    );
    const normalizedContactLinks = useMemo(
        () =>
            resolvedContactLinks.filter((item) => item.label?.trim?.().length),
        [resolvedContactLinks]
    );
    const socialLinkItems = useMemo<FooterLinkItem[]>(
        () =>
            resolvedSocialLinks.map((link) => ({
                label: link.platform,
                href: link.url,
            })),
        [resolvedSocialLinks]
    );
    const contactSectionItems = normalizedContactLinks;

    return (
        <footer className="bg-[#FAF7FF] border-t border-[#884be3]/20 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-serif text-[#884be3] mb-4 font-bold">
                            <Image
                                src={"/logo.png"}
                                height={80}
                                width={100}
                                alt={resolvedCompanyName}
                            />
                        </h3>
                        <p className="text-[#6B4BA8] text-sm mb-4">
                            {resolvedDescription}
                        </p>
                        <div className="flex gap-3">
                            {resolvedSocialLinks.map((link) => {
                                const Icon = resolveIcon(
                                    normalizeIconName(link.icon_name)
                                );
                                return (
                                    <motion.a
                                        key={link.id}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-[#884be3] group transition-colors"
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Icon
                                            size={16}
                                            className="text-[#6B4BA8] group-hover:text-white transition-colors"
                                        />
                                    </motion.a>
                                );
                            })}
                        </div>
                    </motion.div>

                    {[
                        { title: "যোগাযোগ করুন", items: contactSectionItems },
                        { title: "সোশাল লিঙ্ক", items: socialLinkItems },
                    ].map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h4 className="font-semibold text-[#2D1B4E] mb-4">
                                {section.title}
                            </h4>
                            <ul className="space-y-2">
                                {section.items.map((link) => (
                                    <motion.li
                                        key={link.label}
                                        whileHover={{ x: 5 }}
                                    >
                                        <a
                                            href={link.href ?? "#"}
                                            className="text-sm text-[#6B4BA8] hover:text-[#884be3] transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="mt-8 pt-8 border-t border-[#884be3]/20 text-center text-sm text-[#6B4BA8]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    {resolvedBottomText}
                </motion.div>
            </div>
        </footer>
    );
}
