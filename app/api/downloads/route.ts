import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { bookId, name, email, phone, address } = await request.json();

  if (!bookId || !name || !email || !phone || !address) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    await execute(
      `
      INSERT INTO downloads (id, book_id, name, email, phone, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [randomUUID(), bookId, name, email, phone, address],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving download request', error);
    return NextResponse.json({ error: 'Failed to save download' }, { status: 500 });
  }
}
