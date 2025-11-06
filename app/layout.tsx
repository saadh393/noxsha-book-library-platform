import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
    subsets: ["latin", "bengali"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
    title: "Noxsha",
    description: "আপনার পছন্দের ডিজিটাল বই আবিষ্কার ও পরিচালনার প্ল্যাটফর্ম।",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="bn">
            <body
                className={`${hindSiliguri.className} ${hindSiliguri.variable} min-h-screen bg-[#FAF7FF] text-[#2D1B4E]`}
            >
                {children}
            </body>
        </html>
    );
}
