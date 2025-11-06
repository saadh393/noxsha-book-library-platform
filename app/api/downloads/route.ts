import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth-server";
import type { Download, DownloadDocument } from "@/lib/types";

export async function GET(request: NextRequest) {
    const session = getSessionFromRequest(request);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const collection = await getCollection<DownloadDocument>("downloads");
        const documents = await collection
            .aggregate<
                DownloadDocument & {
                    book_title?: string | null;
                }
            >([
                { $sort: { created_at: -1 } },
                {
                    $lookup: {
                        from: "books",
                        localField: "book_id",
                        foreignField: "id",
                        as: "book_docs",
                    },
                },
                {
                    $addFields: {
                        book_title: {
                            $cond: [
                                { $gt: [{ $size: "$book_docs" }, 0] },
                                { $arrayElemAt: ["$book_docs.title", 0] },
                                null,
                            ],
                        },
                    },
                },
                { $project: { book_docs: 0 } },
            ])
            .toArray();

        const data = documents.map<Download>((doc) => ({
            id: doc.id,
            book_id: doc.book_id,
            book_title:
                typeof doc.book_title === "string" ? doc.book_title : null,
            name: doc.name,
            email: doc.email,
            phone: doc.phone,
            address: doc.address,
            created_at:
                doc.created_at instanceof Date
                    ? doc.created_at.toISOString()
                    : new Date(doc.created_at).toISOString(),
        }));
        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error fetching download records", error);
        return NextResponse.json(
            { error: "Failed to fetch downloads" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const { bookId, name, email, phone, address } = await request.json();

    if (!bookId || !name || !email || !phone || !address) {
        return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
        );
    }

    try {
        const collection = await getCollection<DownloadDocument>("downloads");
        const id = randomUUID();

        await collection.insertOne({
            _id: id,
            id,
            book_id: bookId,
            name,
            email,
            phone,
            address,
            created_at: new Date(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving download request", error);
        return NextResponse.json(
            { error: "Failed to save download" },
            { status: 500 }
        );
    }
}
