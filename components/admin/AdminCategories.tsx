"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Palette, Pencil, Plus, Save, X, Trash2, Loader2 } from "lucide-react";
import {
    createCategory,
    deleteCategory,
    fetchCategories,
    updateCategory,
} from "@/lib/api";
import type { Category } from "@/lib/types";

const MIN_LIGHTNESS = 5;
const MAX_LIGHTNESS = 50;

interface StatusMessage {
    type: "success" | "error";
    text: string;
}

interface CategoryFormState {
    name: string;
    icon_name: string;
    h: number;
    s: number;
    l: number;
}

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

function resolveLucideIcon(name: string): LucideIcon | null {
    if (!name) return null;
    const record = LucideIcons as Record<string, unknown>;

    const candidate = record[name];
    if (typeof candidate === "object" && candidate !== null) {
        return candidate as LucideIcon;
    }

    return null;
}

const FALLBACK_ICON =
    resolveLucideIcon("BookOpen") ??
    ((LucideIcons as Record<string, unknown>).BookOpen as LucideIcon);

const DEFAULT_ICON_NAMES = [
    "BookOpen",
    "Scroll",
    "Sparkles",
    "TrendingUp",
    "Brain",
    "Briefcase",
    "Wallet",
    "MessageSquare",
    "Feather",
    "Library",
    "Zap",
    "Compass",
    "HeartPulse",
    "Cpu",
] as const;

const ICON_OPTIONS = DEFAULT_ICON_NAMES.map((name) => ({
    name,
    icon: resolveLucideIcon(name) ?? FALLBACK_ICON,
}));

const DEFAULT_FORM: CategoryFormState = {
    name: "",
    icon_name: DEFAULT_ICON_NAMES[0],
    h: 260,
    s: 60,
    l: 45,
};

function toHsl(h: number, s: number, l: number) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<StatusMessage | null>(null);
    const [formState, setFormState] = useState<CategoryFormState>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        void loadCategories();
    }, []);

    const categoryCount = useMemo(() => categories.length, [categories.length]);

    async function loadCategories() {
        try {
            setIsLoading(true);
            const response = await fetchCategories();
            setCategories(response.data ?? []);
        } catch (error) {
            console.error("Failed to load categories", error);
            setStatus({
                type: "error",
                text: "ক্যাটেগরি লোড করতে ব্যর্থ হলাম",
            });
        } finally {
            setIsLoading(false);
        }
    }

    function resetForm() {
        setFormState(DEFAULT_FORM);
        setEditingId(null);
    }

    function handleInputChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = event.target;
        setFormState((prev) => {
            if (name === "h" || name === "s" || name === "l") {
                return { ...prev, [name]: Number(value) };
            }

            return { ...prev, [name]: value };
        });
    }

    const normalizedIconName = normalizeIconName(formState.icon_name);
    const resolvedIcon = resolveLucideIcon(normalizedIconName);
    const PreviewIcon = resolvedIcon ?? FALLBACK_ICON;
    const iconColor = toHsl(formState.h, formState.s, formState.l);
    const backgroundColor = toHsl(formState.h, formState.s, 85);
    const isIconValid = Boolean(formState.icon_name.trim() && resolvedIcon);
    const isNameValid = formState.name.trim().length >= 2;
    const iconFeedback =
        formState.icon_name.trim() && !resolvedIcon
            ? "আইকনটির নাম Lucide লাইব্রেরিতে পাওয়া যায়নি"
            : null;
    const isSubmitDisabled = isSaving || !isNameValid || !isIconValid;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isNameValid) {
            setStatus({
                type: "error",
                text: "ক্যাটেগরির ইংরেজি বা বাংলা নাম কমপক্ষে ২ অক্ষরের হতে হবে",
            });
            return;
        }

        if (!isIconValid) {
            setStatus({
                type: "error",
                text: "সঠিক আইকন নাম নির্বাচন বা লিখুন",
            });
            return;
        }

        setIsSaving(true);
        const payload = {
            name: formState.name.trim(),
            icon_name: normalizedIconName,
            color: {
                h: Math.max(0, Math.min(360, Math.round(formState.h))),
                s: Math.max(0, Math.min(100, Math.round(formState.s))),
                l: Math.max(
                    MIN_LIGHTNESS,
                    Math.min(MAX_LIGHTNESS, Math.round(formState.l))
                ),
            },
        };

        try {
            if (editingId) {
                await updateCategory(editingId, payload);
                setStatus({ type: "success", text: "ক্যাটেগরি আপডেট হয়েছে" });
            } else {
                await createCategory(payload);
                setStatus({
                    type: "success",
                    text: "নতুন ক্যাটেগরি যুক্ত হয়েছে",
                });
            }

            await loadCategories();
            resetForm();
        } catch (error) {
            console.error("Failed to save category", error);
            setStatus({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "ক্যাটেগরি সংরক্ষণ করতে ব্যর্থ হলাম",
            });
        } finally {
            setIsSaving(false);
        }
    }

    function startEdit(category: Category) {
        setEditingId(category.id);
        setFormState({
            name: category.name,
            icon_name: category.icon_name,
            h: category.color_h,
            s: category.color_s,
            l: category.color_l,
        });
    }

    async function handleDelete(category: Category) {
        if (!confirm(`'${category.name}' ক্যাটেগরি মুছে ফেলতে চান?`)) {
            return;
        }

        try {
            setIsDeleting(category.id);
            await deleteCategory(category.id);
            setStatus({ type: "success", text: "ক্যাটেগরি মুছে ফেলা হয়েছে" });
            await loadCategories();
            if (editingId === category.id) {
                resetForm();
            }
        } catch (error) {
            console.error("Failed to delete category", error);
            setStatus({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "ক্যাটেগরি মুছে ফেলতে ব্যর্থ হলাম",
            });
        } finally {
            setIsDeleting(null);
        }
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#2D1B4E]">
                        ক্যাটেগরি ব্যবস্থাপনা
                    </h2>
                    <p className="text-sm text-[#6B4BA8] mt-1">
                        বর্তমানে মোট {categoryCount.toLocaleString("bn-BD")} টি
                        ক্যাটেগরি রয়েছে
                    </p>
                </div>
            </div>

            {status && (
                <div
                    className={`rounded-lg px-4 py-3 flex items-center gap-3 ${
                        status.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                >
                    {status.text}
                    <button
                        onClick={() => setStatus(null)}
                        className="ml-auto text-sm underline"
                    >
                        বন্ধ করুন
                    </button>
                </div>
            )}

            <motion.form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl border border-[#884be3]/15 shadow-sm p-6 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors ${
                            isIconValid
                                ? ""
                                : "border-red-300 ring-2 ring-red-200"
                        }`}
                        style={{
                            backgroundColor,
                            borderColor: isIconValid ? iconColor : "#f87171",
                        }}
                    >
                        <PreviewIcon size={28} color={iconColor} />
                    </div>
                    <div>
                        <p className="text-sm text-[#6B4BA8]">প্রিভিউ</p>
                        <p className="font-semibold text-[#2D1B4E]">
                            {formState.name || "নতুন ক্যাটেগরি"}
                        </p>
                        <p className="text-xs text-[#6B4BA8]">
                            HSL: {formState.h}, {formState.s}%, {formState.l}%
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#2D1B4E]">
                            ক্যাটেগরি (ইংরেজি বা বাংলা) *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formState.name}
                            onChange={handleInputChange}
                            required
                            placeholder="উদাহরণ: Business বা ব্যবসা"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                        />
                        <p className="text-xs text-[#6B4BA8]">
                            ডাটাবেজে এই নাম সংরক্ষণ করা হবে এবং বই যোগ করার সময়
                            তালিকায় দেখানো হবে।
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#2D1B4E]">
                            দ্রুত আইকন নির্বাচন
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {ICON_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                const isActive =
                                    normalizeIconName(formState.icon_name) ===
                                    option.name;
                                return (
                                    <button
                                        type="button"
                                        key={option.name}
                                        onClick={() => {
                                            setFormState((prev) => ({
                                                ...prev,
                                                icon_name: option.name,
                                            }));
                                        }}
                                        className={`rounded-lg border p-3 flex flex-col items-center gap-2 text-sm transition-colors ${
                                            isActive
                                                ? "border-[#884be3] bg-[#F4EBFF] text-[#4C1D95]"
                                                : "border-gray-200 hover:border-[#884be3]/50"
                                        }`}
                                    >
                                        <Icon size={22} />
                                        <span>{option.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#2D1B4E]">
                            কাস্টম আইকন নাম *
                        </label>
                        <input
                            type="text"
                            name="icon_name"
                            value={formState.icon_name}
                            onChange={handleInputChange}
                            placeholder="উদাহরণ: BookOpen অথবা badge-alert"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                        />
                        <p className="text-xs text-[#6B4BA8]">
                            Lucide আইকনের সম্পূর্ণ তালিকা:{" "}
                            <a
                                href="https://lucide.dev/icons/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#884be3] underline"
                            >
                                lucide.dev/icons
                            </a>
                        </p>
                        {iconFeedback && (
                            <p className="text-xs text-red-600">
                                {iconFeedback}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-[#2D1B4E] flex items-center gap-2">
                            <Palette size={16} />
                            রঙ নির্বাচন
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-medium text-[#2D1B4E]">
                                    Hue (0-360)
                                </label>
                                <input
                                    type="range"
                                    name="h"
                                    min={0}
                                    max={360}
                                    value={formState.h}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                                <input
                                    type="number"
                                    name="h"
                                    min={0}
                                    max={360}
                                    value={formState.h}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[#2D1B4E]">
                                    Saturation (0-100)
                                </label>
                                <input
                                    type="range"
                                    name="s"
                                    min={0}
                                    max={100}
                                    value={formState.s}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                                <input
                                    type="number"
                                    name="s"
                                    min={0}
                                    max={100}
                                    value={formState.s}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-[#2D1B4E]">
                                    Lightness (৫-৫০)
                                </label>
                                <input
                                    type="range"
                                    name="l"
                                    min={MIN_LIGHTNESS}
                                    max={MAX_LIGHTNESS}
                                    value={formState.l}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                                <input
                                    type="number"
                                    name="l"
                                    min={MIN_LIGHTNESS}
                                    max={MAX_LIGHTNESS}
                                    value={formState.l}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                                />
                                <p className="text-xs text-[#6B4BA8] mt-1">
                                    আইকনের রঙের Lightness ৫০-এর কম রাখা
                                    প্রয়োজন। ব্যাকগ্রাউন্ড স্বয়ংক্রিয়ভাবে ৮৫
                                    হবে।
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        type="submit"
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors ${
                            isSubmitDisabled
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#884be3] text-white hover:bg-[#6B4BA8]"
                        }`}
                        whileHover={
                            isSubmitDisabled ? undefined : { scale: 1.03 }
                        }
                        whileTap={
                            isSubmitDisabled ? undefined : { scale: 0.97 }
                        }
                        disabled={isSubmitDisabled}
                    >
                        {isSaving ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : editingId ? (
                            <Save size={18} />
                        ) : (
                            <Plus size={18} />
                        )}
                        {editingId
                            ? "ক্যাটেগরি আপডেট করুন"
                            : "নতুন ক্যাটেগরি যুক্ত করুন"}
                    </motion.button>
                    {editingId && (
                        <motion.button
                            type="button"
                            onClick={resetForm}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 hover:border-[#884be3]/50 transition-colors"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <X size={18} />
                            বাতিল করুন
                        </motion.button>
                    )}
                </div>
            </motion.form>

            <section className="space-y-4">
                <h3 className="text-xl font-semibold text-[#2D1B4E]">
                    বিদ্যমান ক্যাটেগরি
                </h3>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12 text-[#6B4BA8] gap-3">
                        <Loader2 className="animate-spin" size={20} />
                        <span>ক্যাটেগরি লোড হচ্ছে...</span>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-12 text-center text-[#6B4BA8] bg-white rounded-xl border border-dashed border-[#884be3]/30">
                        এখনো কোনো ক্যাটেগরি যোগ করা হয়নি।
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {categories.map((category) => {
                            const normalized = normalizeIconName(
                                category.icon_name
                            );
                            const Icon =
                                resolveLucideIcon(normalized) ?? FALLBACK_ICON;
                            const iconColorValue = toHsl(
                                category.color_h,
                                category.color_s,
                                category.color_l
                            );
                            const backgroundValue = toHsl(
                                category.color_h,
                                category.color_s,
                                85
                            );

                            return (
                                <motion.div
                                    key={category.id}
                                    className="bg-white border border-[#884be3]/10 rounded-xl p-5 shadow-sm flex flex-col gap-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center border"
                                                style={{
                                                    backgroundColor:
                                                        backgroundValue,
                                                    borderColor: iconColorValue,
                                                }}
                                            >
                                                <Icon
                                                    size={24}
                                                    style={{
                                                        color: iconColorValue,
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#2D1B4E]">
                                                    {category.name}
                                                </h4>
                                                <p className="text-xs text-[#6B4BA8]">
                                                    Icon: {normalized} •
                                                    Lightness {category.color_l}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    startEdit(category)
                                                }
                                                className="p-2 rounded-lg bg-[#EDE9FE] text-[#6B4BA8] hover:bg-[#DDD6FE] transition-colors"
                                                title="সম্পাদনা"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(category)
                                                }
                                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                                                disabled={
                                                    isDeleting === category.id
                                                }
                                                title="মুছুন"
                                            >
                                                {isDeleting === category.id ? (
                                                    <Loader2
                                                        className="animate-spin"
                                                        size={16}
                                                    />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-[#6B4BA8]">
                                        <span>
                                            আপডেট:{" "}
                                            {new Date(
                                                category.updated_at
                                            ).toLocaleDateString("bn-BD")}
                                        </span>
                                        <span>
                                            ID: {category.id.slice(0, 8)}…
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
