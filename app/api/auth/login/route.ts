import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";
import { query } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth-server";

type AdminRow = RowDataPacket & {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    is_active: number;
};

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json(
            { error: "Email and password are required" },
            { status: 400 }
        );
    }

    try {
        const rows = await query<AdminRow[]>(
            "SELECT * FROM admin_users WHERE email = ? LIMIT 1",
            [email]
        );
        console.log(rows);
        const admin = rows[0];

        if (!admin || !admin.is_active) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const isMatch = await compare(password, admin.password_hash);

        if (!isMatch) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
            },
        });

        setSessionCookie(response, {
            id: admin.id,
            email: admin.email,
            name: admin.name,
        });

        return response;
    } catch (error) {
        console.error("Error during admin login", error);
        return NextResponse.json({ error: "Failed to login" }, { status: 500 });
    }
}
