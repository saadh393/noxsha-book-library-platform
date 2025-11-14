import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import BookDetailsPageClient from "@/components/books/BookDetailsPageClient";
import { getCollection } from "@/lib/db";
import { serializeBook } from "@/lib/serializers";
import type { Book, BookDocument } from "@/lib/types";
import { getFooterContent, getHeaderContent } from "@/lib/page-data.server";

export const revalidate = 3600;
export const dynamicParams = true;

const getBookData = cache(async (id: string) => {
    const collection = await getCollection<BookDocument>("books");
    const document = await collection.findOne({ _id: id });

    if (!document) {
        return null;
    }

    const book = serializeBook(document);

    const relatedDocuments = await collection
        .find({ category: book.category, _id: { $ne: id } })
        .sort({ created_at: -1 })
        .limit(5)
        .toArray();

    const related = relatedDocuments.map((doc) => serializeBook(doc));

    return { book, related };
});

type PageParams = {
    params: { id: string };
};

export async function generateMetadata({
    params,
}: PageParams): Promise<Metadata> {
    const { id } = await params;
    const data = await getBookData(id);

    if (!data) {
        return {
            title: "বই পাওয়া যায়নি | নোকশা",
            description: "অনুরোধকৃত বইটি খুঁজে পাওয়া যায়নি।",
        };
    }

    const { book } = data;
    const title = `${book.title} – ${book.author} | নোকশা`;
    const description = book.description?.length
        ? book.description.slice(0, 155)
        : `${book.title} বইটি এখন নোকশা ডিজিটাল লাইব্রেরিতে উপলব্ধ।`;
    const keywords = [
        book.title,
        book.author,
        book.category,
        "ই-বুক",
        "ডিজিটাল লাইব্রেরি",
        "Noxsha",
    ];
    const image = book.image_url ?? undefined;

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `/books/${book.id}`,
        },
        openGraph: {
            title,
            description,
            type: "article",
            images: image ? [{ url: image, alt: book.title }] : undefined,
        },
        twitter: {
            card: image ? "summary_large_image" : "summary",
            title,
            description,
            images: image ? [image] : undefined,
        },
    };
}

export default async function BookDetailsPage({ params }: PageParams) {
    const { id } = await params;
    const [data, headerContent, footerContent] = await Promise.all([
        getBookData(id),
        getHeaderContent(),
        getFooterContent(),
    ]);

    if (!data) {
        notFound();
    }

    return (
        <BookDetailsPageClient
            book={data.book}
            related={data.related}
            headerContent={headerContent}
            footerContent={footerContent}
        />
    );
}
