"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    AlertCircle,
    CheckCircle,
    Edit2,
    Globe,
    Github,
    Linkedin,
    Plus,
    Save,
    Trash2,
    Twitter,
    X,
    Youtube,
    Facebook,
    Instagram,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
    createSocialLink as createSocialLinkRequest,
    deleteSocialLink as deleteSocialLinkRequest,
    fetchSocialLinks as fetchSocialLinksRequest,
    updateSocialLink as updateSocialLinkRequest,
} from "@/lib/api";

interface SocialLink {
    id: string;
    platform: string;
    url: string;
    icon_name: string;
    is_active: boolean;
}

interface FormState {
    platform: string;
    url: string;
    icon_name: string;
}

const QUICK_ICONS = [
    { name: "Facebook", icon: Facebook },
    { name: "Instagram", icon: Instagram },
    { name: "Twitter", icon: Twitter },
    { name: "Linkedin", icon: Linkedin },
    { name: "Youtube", icon: Youtube },
    { name: "Github", icon: Github },
] as const;

const FALLBACK_ICON = Globe;

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

function resolveIcon(name: string): LucideIcon | null {
    if (!name) return null;
    const record = LucideIcons as Record<string, unknown>;
    const candidate = record[name];
    if (typeof candidate === "object") {
        return candidate as LucideIcon;
    }
    return null;
}

export default function AdminSocialLinks() {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormState>({
        platform: "",
        url: "",
        icon_name: "",
    });

    useEffect(() => {
        void fetchLinks();
    }, []);

    async function fetchLinks() {
        try {
            const { data } = await fetchSocialLinksRequest();
            setLinks(data ?? []);
        } catch (error) {
            setMessage({
                type: "error",
                text: "সোশ্যাল লিংক লোড করতে ব্যর্থ হয়েছি",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function toggleActive(id: string, isActive: boolean) {
        try {
            await updateSocialLinkRequest(id, { is_active: !isActive });
            setLinks((prev) =>
                prev.map((link) =>
                    link.id === id ? { ...link, is_active: !isActive } : link
                )
            );
            setMessage({ type: "success", text: "অবস্থা আপডেট করা হয়েছে" });
            setTimeout(() => setMessage(null), 2000);
        } catch (error) {
            setMessage({ type: "error", text: "অবস্থা আপডেট ব্যর্থ হয়েছে" });
        }
    }

    async function deleteLink(id: string) {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই লিংকটি মুছে ফেলতে চান?")) {
            return;
        }
        try {
            await deleteSocialLinkRequest(id);
            setLinks((prev) => prev.filter((link) => link.id !== id));
            setMessage({
                type: "success",
                text: "লিংক সফলভাবে মুছে ফেলা হয়েছে",
            });
            setTimeout(() => setMessage(null), 2000);
        } catch (error) {
            setMessage({
                type: "error",
                text: "লিংক মুছে ফেলতে ব্যর্থ হয়েছি",
            });
        }
    }

    async function saveLink() {
        if (
            !formData.platform.trim() ||
            !formData.url.trim() ||
            !formData.icon_name.trim()
        ) {
            setMessage({ type: "error", text: "সব ঘর পূরণ করা আবশ্যক" });
            return;
        }

        const normalizedIcon = normalizeIconName(formData.icon_name);
        const iconExists = resolveIcon(normalizedIcon);

        if (!iconExists) {
            setMessage({
                type: "error",
                text: "সঠিক Lucide আইকন নাম লিখুন বা নির্বাচন করুন",
            });
            return;
        }

        const payload = {
            ...formData,
            icon_name: normalizedIcon,
        };

        try {
            if (editingId) {
                await updateSocialLinkRequest(editingId, payload);
                setLinks((prev) =>
                    prev.map((link) =>
                        link.id === editingId ? { ...link, ...payload } : link
                    )
                );
                setMessage({
                    type: "success",
                    text: "লিংক আপডেট সম্পন্ন হয়েছে",
                });
            } else {
                const { data } = await createSocialLinkRequest(payload);
                setLinks((prev) => [...prev, data]);
                setMessage({ type: "success", text: "নতুন লিংক যুক্ত হয়েছে" });
            }

            setFormData({ platform: "", url: "", icon_name: "" });
            setEditingId(null);
            setIsAddingNew(false);
            setTimeout(() => setMessage(null), 2000);
        } catch (error) {
            setMessage({
                type: "error",
                text: "লিংক সংরক্ষণ করতে ব্যর্থ হয়েছি",
            });
        }
    }

    function startCreate() {
        setIsAddingNew(true);
        setEditingId(null);
        setFormData({ platform: "", url: "", icon_name: "" });
    }

    function startEdit(link: SocialLink) {
        setIsAddingNew(false);
        setEditingId(link.id);
        setFormData({
            platform: link.platform,
            url: link.url,
            icon_name: link.icon_name,
        });
    }

    function cancelForm() {
        setIsAddingNew(false);
        setEditingId(null);
        setFormData({ platform: "", url: "", icon_name: "" });
    }

    const normalizedIconName = normalizeIconName(formData.icon_name);
    const resolvedIcon = resolveIcon(normalizedIconName);
    const PreviewIcon = resolvedIcon ?? FALLBACK_ICON;
    const isIconValid = !!formData.icon_name.trim() && !!resolvedIcon;
    const iconFeedback =
        formData.icon_name.trim() && !resolvedIcon
            ? "Lucide লাইব্রেরিতে এই আইকনটি খুঁজে পাওয়া যায়নি"
            : null;
    const isFormSubmittable =
        Boolean(formData.platform.trim()) &&
        Boolean(formData.url.trim()) &&
        isIconValid;

    const quickIconButtons = useMemo(
        () =>
            QUICK_ICONS.map((option) => (
                <button
                    type="button"
                    key={option.name}
                    onClick={() =>
                        setFormData((prev) => ({
                            ...prev,
                            icon_name: option.name,
                        }))
                    }
                    className={`rounded-lg border px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                        normalizeIconName(formData.icon_name) === option.name
                            ? "border-[#884be3] bg-[#F4EBFF] text-[#4C1D95]"
                            : "border-gray-200 hover:border-[#884be3]/50"
                    }`}
                >
                    <option.icon size={18} />
                    {option.name}
                </button>
            )),
        [formData.icon_name]
    );

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    {[0, 1, 2].map((key) => (
                        <div
                            key={key}
                            className="h-20 bg-gray-200 rounded-lg"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-[#2D1B4E]">
                        সোশ্যাল মিডিয়া লিংক
                    </h2>
                    <p className="text-sm text-[#6B4BA8] mt-1">
                        আইকন নির্বাচন করতে তালিকা থেকে ক্লিক করুন অথবা Lucide
                        ওয়েবসাইটের নাম কপি করে এখানে পেস্ট করুন।
                    </p>
                </div>
                <motion.button
                    onClick={startCreate}
                    className="bg-[#884be3] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#6B4BA8] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus size={20} />
                    নতুন লিংক
                </motion.button>
            </div>

            {message && (
                <motion.div
                    className={`flex items-center gap-3 p-4 rounded-lg ${
                        message.type === "success"
                            ? "bg-green-50 border-l-4 border-green-500"
                            : "bg-red-50 border-l-4 border-red-500"
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {message.type === "success" ? (
                        <CheckCircle className="text-green-500" size={20} />
                    ) : (
                        <AlertCircle className="text-red-500" size={20} />
                    )}
                    <p
                        className={
                            message.type === "success"
                                ? "text-green-700"
                                : "text-red-700"
                        }
                    >
                        {message.text}
                    </p>
                </motion.div>
            )}

            {(isAddingNew || editingId) && (
                <motion.div
                    className="bg-white rounded-lg shadow-md p-6 space-y-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
                                isIconValid
                                    ? "border-[#884be3]"
                                    : "border-red-300 ring-2 ring-red-200"
                            }`}
                        >
                            <PreviewIcon
                                size={22}
                                className={
                                    isIconValid
                                        ? "text-[#884be3]"
                                        : "text-red-500"
                                }
                            />
                        </div>
                        <div>
                            <p className="text-sm text-[#6B4BA8]">
                                আইকন প্রিভিউ
                            </p>
                            <p className="text-xs text-[#6B4BA8]">
                                সম্পূর্ণ তালিকা:{" "}
                                <a
                                    href="https://lucide.dev/icons/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#884be3] underline"
                                >
                                    lucide.dev/icons
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            type="text"
                            value={formData.platform}
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    platform: event.target.value,
                                }))
                            }
                            placeholder="প্ল্যাটফর্ম (যেমন, Facebook)"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                        />
                        <input
                            type="url"
                            value={formData.url}
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    url: event.target.value,
                                }))
                            }
                            placeholder="লিংক (যেমন, https://facebook.com/your-page)"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#884be3] outline-none transition-colors"
                        />
                    </div>
                    <input
                        type="text"
                        value={formData.icon_name}
                        onChange={(event) =>
                            setFormData((prev) => ({
                                ...prev,
                                icon_name: event.target.value,
                            }))
                        }
                        placeholder="আইকনের নাম (যেমন, facebook, badge-alert)"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:border-[#884be3] outline-none transition-colors ${
                            isIconValid ? "border-gray-200" : "border-red-300"
                        }`}
                    />
                    {iconFeedback && (
                        <p className="text-xs text-red-600">{iconFeedback}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {quickIconButtons}
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            onClick={saveLink}
                            disabled={!isFormSubmittable}
                            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                isFormSubmittable
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                            }`}
                            whileHover={
                                isFormSubmittable ? { scale: 1.03 } : undefined
                            }
                            whileTap={
                                isFormSubmittable ? { scale: 0.97 } : undefined
                            }
                        >
                            <Save size={18} />
                            সংরক্ষণ করুন
                        </motion.button>
                        <motion.button
                            onClick={cancelForm}
                            className="flex-1 bg-gray-200 text-[#2D1B4E] px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <X size={18} />
                            বাতিল করুন
                        </motion.button>
                    </div>
                </motion.div>
            )}

            <div className="grid gap-4">
                {links.map((link, index) => {
                    const normalized = normalizeIconName(link.icon_name);
                    const Icon = resolveIcon(normalized) ?? FALLBACK_ICON;
                    return (
                        <motion.div
                            key={link.id}
                            className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                                    <Icon
                                        size={20}
                                        className="text-[#884be3]"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#2D1B4E]">
                                        {link.platform}
                                    </h3>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-[#6B4BA8] hover:text-[#884be3] transition-colors"
                                    >
                                        {link.url}
                                    </a>
                                    <p className="text-xs text-[#6B4BA8] mt-1">
                                        আইকন: {normalized}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <motion.button
                                    onClick={() =>
                                        toggleActive(link.id, link.is_active)
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                                        link.is_active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-600"
                                    }`}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {link.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                                </motion.button>
                                <motion.button
                                    onClick={() => startEdit(link)}
                                    className="px-4 py-2 rounded-lg text-sm bg-[#EDE9FE] text-[#6B4BA8] hover:bg-[#DDD6FE] transition-colors flex items-center gap-2"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Edit2 size={16} />
                                    সম্পাদনা
                                </motion.button>
                                <motion.button
                                    onClick={() => deleteLink(link.id)}
                                    className="px-4 py-2 rounded-lg text-sm bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center gap-2"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Trash2 size={16} />
                                    মুছুন
                                </motion.button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
