import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth-server';

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
