import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth-server';

export async function GET() {
  const session = await getSessionFromCookies();

  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: session });
}
