"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

interface BookReaderModalProps {
    title: string;
    isOpen: boolean;
    isLoading: boolean;
    readUrl: string | null;
    errorMessage: string | null;
    onClose: () => void;
}

export default function BookReaderModal({
    title,
    isOpen,
    isLoading,
    readUrl,
    errorMessage,
    onClose,
}: BookReaderModalProps) {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-50 bg-[#12091F]/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 p-3 md:p-6">
                        <motion.div
                            className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.98 }}
                            transition={{ duration: 0.24 }}
                        >
                            <div className="flex items-center justify-between gap-4 border-b border-[#E8DFF8] bg-[#FAF7FF] px-4 py-4 md:px-6">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#884be3]">
                                        Read Online
                                    </p>
                                    <h2 className="truncate text-lg font-semibold text-[#2D1B4E] md:text-xl">
                                        {title}
                                    </h2>
                                </div>
                                <motion.button
                                    type="button"
                                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D8C8F3] text-[#6B4BA8] transition-colors hover:bg-white"
                                    onClick={onClose}
                                    whileHover={{ scale: 1.04, rotate: 90 }}
                                    whileTap={{ scale: 0.96 }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </div>

                            <div className="relative flex-1 bg-[#F4EEFF]">
                                {isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#6B4BA8]">
                                        <Loader2 className="animate-spin" size={28} />
                                        <p className="text-sm font-medium">
                                            বইটি পড়ার জন্য প্রস্তুত করা হচ্ছে...
                                        </p>
                                    </div>
                                )}

                                {!isLoading && errorMessage && (
                                    <div className="absolute inset-0 flex items-center justify-center p-6">
                                        <div className="max-w-md rounded-2xl border border-red-200 bg-white px-6 py-5 text-center shadow-sm">
                                            <p className="text-base font-semibold text-[#2D1B4E]">
                                                PDF খোলা যায়নি
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-red-600">
                                                {errorMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!isLoading && !errorMessage && readUrl && (
                                    <iframe
                                        title={`${title} PDF reader`}
                                        src={`${readUrl}#toolbar=1&navpanes=0&view=FitH`}
                                        className="h-full w-full border-0"
                                    />
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
