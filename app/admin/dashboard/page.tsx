"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboardShell from "@/components/admin/AdminDashboardShell";
import { getSession } from "@/lib/auth";

export default function AdminDashboardPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        (async () => {
            const session = await getSession();
            if (!session) {
                setIsCheckingAuth(false);
                router.replace("/admin/login");
                return;
            }

            setIsAuthorized(true);
            setIsCheckingAuth(false);
        })();
    }, [router]);

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-12 h-12 border-4 border-[#884be3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <AdminDashboardShell
            onLogout={() => {
                setIsAuthorized(false);
                router.replace("/admin/login");
            }}
        />
    );
}
