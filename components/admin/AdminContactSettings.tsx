"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Plus, Save, Trash2 } from "lucide-react";
import { fetchSiteSettings, updateSiteSettings } from "@/lib/api";
import type { FooterLinkItem } from "@/lib/page-data";

const CONTACT_SETTING_KEYS = ["footer_contact_links"] as const;

function parseContactLinks(value?: string): FooterLinkItem[] {
    if (!value) return [{ label: "", href: "" }];

    try {
        const parsed = JSON.parse(value) as FooterLinkItem[];
        if (Array.isArray(parsed) && parsed.length) {
            return parsed.map((item) => ({
                label: item.label ?? "",
                href: item.href ?? "",
            }));
        }
    } catch (error) {
        console.error("Failed to parse contact links", error);
    }

    return [{ label: "", href: "" }];
}

export default function AdminContactSettings() {
    const [contactLinks, setContactLinks] = useState<FooterLinkItem[]>([
        { label: "", href: "" },
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        void loadContactSettings();
    }, []);

    async function loadContactSettings() {
        try {
            const { data } = await fetchSiteSettings([...CONTACT_SETTING_KEYS]);
            setContactLinks(parseContactLinks(data.footer_contact_links));
        } catch (error) {
            console.error("Failed to load contact settings", error);
            setMessage({
                type: "error",
                text: "যোগাযোগ সেটিংস লোড করা যায়নি।",
            });
        } finally {
            setIsLoading(false);
        }
    }

    function updateContactLink(
        index: number,
        field: keyof FooterLinkItem,
        value: string
    ) {
        setContactLinks((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            )
        );
    }

    function addContactLink() {
        setContactLinks((current) => [...current, { label: "", href: "" }]);
    }

    function removeContactLink(index: number) {
        setContactLinks((current) => {
            const next = current.filter((_, itemIndex) => itemIndex !== index);
            return next.length ? next : [{ label: "", href: "" }];
        });
    }

    async function handleSave() {
        setIsSaving(true);
        setMessage(null);

        const normalizedLinks = contactLinks
            .map((item) => ({
                label: item.label.trim(),
                href: item.href?.trim() || undefined,
            }))
            .filter((item) => item.label.length);

        try {
            await updateSiteSettings({
                footer_contact_links: JSON.stringify(normalizedLinks),
            });
            setContactLinks(
                normalizedLinks.length
                    ? normalizedLinks
                    : [{ label: "", href: "" }]
            );
            setMessage({
                type: "success",
                text: "যোগাযোগ তথ্য সফলভাবে সংরক্ষিত হয়েছে।",
            });
        } catch (error) {
            console.error("Failed to save contact settings", error);
            setMessage({
                type: "error",
                text: "যোগাযোগ তথ্য সংরক্ষণ করা যায়নি।",
            });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-24 rounded-lg bg-gray-200" />
                    <div className="h-32 rounded-lg bg-gray-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#2D1B4E]">
                    যোগাযোগ সেটিংস
                </h2>
                <p className="mt-2 text-[#6B4BA8]">
                    ফুটারের যোগাযোগ তালিকায় যে তথ্য দেখাবে, তা এখানে আপডেট করুন।
                </p>
            </div>

            {message && (
                <motion.div
                    className={`mb-6 flex items-center gap-3 rounded-xl p-4 ${
                        message.type === "success"
                            ? "border border-green-200 bg-green-50 text-green-700"
                            : "border border-red-200 bg-red-50 text-red-700"
                    }`}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {message.type === "success" ? (
                        <CheckCircle size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                    <p>{message.text}</p>
                </motion.div>
            )}

            <div className="max-w-4xl space-y-4">
                {contactLinks.map((item, index) => (
                    <motion.div
                        key={index}
                        className="grid gap-4 rounded-lg bg-white p-5 shadow-md md:grid-cols-[1fr_1fr_auto]"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                    >
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-[#2D1B4E]">
                                প্রদর্শিত লেখা
                            </span>
                            <input
                                type="text"
                                value={item.label}
                                onChange={(event) =>
                                    updateContactLink(
                                        index,
                                        "label",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none transition-colors focus:border-[#884be3]"
                                placeholder="Email: hello@example.com"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-[#2D1B4E]">
                                লিঙ্ক
                            </span>
                            <input
                                type="text"
                                value={item.href ?? ""}
                                onChange={(event) =>
                                    updateContactLink(
                                        index,
                                        "href",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 outline-none transition-colors focus:border-[#884be3]"
                                placeholder="mailto:hello@example.com"
                            />
                        </label>

                        <button
                            type="button"
                            onClick={() => removeContactLink(index)}
                            className="mt-7 inline-flex h-12 items-center justify-center rounded-lg border border-red-100 px-4 text-red-600 transition-colors hover:bg-red-50"
                            aria-label="যোগাযোগ তথ্য মুছুন"
                        >
                            <Trash2 size={18} />
                        </button>
                    </motion.div>
                ))}

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={addContactLink}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#E7DDF8] bg-white px-5 py-3 font-semibold text-[#6B4BA8] transition-colors hover:bg-[#FAF7FF]"
                    >
                        <Plus size={18} />
                        নতুন তথ্য যোগ করুন
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#884be3] to-[#6B4BA8] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60"
                    >
                        <Save size={18} />
                        {isSaving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
                    </button>
                </div>
            </div>
        </div>
    );
}
