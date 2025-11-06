"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetchCategories, fetchSiteSettings } from "@/lib/api";
import type { Category } from "@/lib/types";

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
    const normalized = normalizeIconName(name);
    const record = LucideIcons as Record<string, unknown>;
    const candidate = record[normalized];
    if (typeof candidate === "object") {
        return candidate as LucideIcon;
    }
    const fallback = record.BookOpen;
    return (typeof fallback === "object" ? fallback : () => null) as LucideIcon;
}

export default function CategorySection() {
    const [title, setTitle] = useState("ক্যাটেগরি");
    const [ctaLabel, setCtaLabel] = useState("সব দেখুন");
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const [settingsResponse, categoriesResponse] =
                    await Promise.all([
                        fetchSiteSettings([
                            "category_section_title",
                            "category_section_cta_label",
                        ]),
                        fetchCategories(),
                    ]);

                if (!isMounted) return;

                const settings = settingsResponse.data;
                if (settings.category_section_title) {
                    setTitle(settings.category_section_title);
                }
                if (settings.category_section_cta_label) {
                    setCtaLabel(settings.category_section_cta_label);
                }

                if (categoriesResponse.data?.length) {
                    setCategories(categoriesResponse.data);
                }
            } catch (error) {
                console.error("Failed to load category section content", error);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    const sortedCategories = useMemo(
        () =>
            categories
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, "en")),
        [categories]
    );

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    className="flex items-center justify-between mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-serif text-[#2D1B4E]">
                        {title}
                    </h2>
                    <motion.button
                        className="flex items-center gap-2 text-[#6B4BA8] hover:text-[#884be3] transition-colors"
                        whileHover={{ x: 5 }}
                    >
                        {ctaLabel}
                        <ArrowRight size={18} />
                    </motion.button>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {sortedCategories.map((category, index) => {
                        const Icon = resolveIcon(category.icon_name);
                        const hue = Number.isFinite(category.color_h)
                            ? category.color_h
                            : 260;
                        const saturation = Number.isFinite(category.color_s)
                            ? category.color_s
                            : 60;
                        const lightness = Number.isFinite(category.color_l)
                            ? category.color_l
                            : 45;
                        const iconColor = `hsl(${hue}, ${saturation}%, ${Math.min(
                            lightness,
                            50
                        )}%)`;
                        const backgroundColor = `hsl(${hue}, ${saturation}%, 85%)`;
                        const borderColor = `hsl(${hue}, ${Math.min(
                            saturation + 10,
                            100
                        )}%, ${Math.max(Math.min(lightness, 50) - 10, 20)}%)`;
                        return (
                            <motion.div
                                key={category.id}
                                className="rounded-lg p-6 cursor-pointer group border transition-shadow"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div
                                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                                    style={{ backgroundColor, borderColor }}
                                >
                                    <Icon size={24} color={iconColor} />
                                </div>
                                <h3 className="font-semibold text-[#2D1B4E] mb-1">
                                    {category.name}
                                </h3>
                                {typeof category.book_count === "number" && (
                                    <p className="text-sm text-[#6B4BA8]">
                                        {category.book_count.toLocaleString(
                                            "bn-BD"
                                        )}{" "}
                                        টি বই
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
