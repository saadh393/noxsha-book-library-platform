"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getSession } from "@/lib/auth";

export default function AdminLoginPage() {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        (async () => {
            const session = await getSession();
            if (session) {
                router.replace("/admin/dashboard");
            } else {
                setIsCheckingAuth(false);
            }
        })();
    }, [router]);

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF7FF]">
                <div className="w-12 h-12 border-4 border-[#884be3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <AdminLoginForm
            onLoginSuccess={() => {
                router.replace("/admin/dashboard");
            }}
        />
    );
}
