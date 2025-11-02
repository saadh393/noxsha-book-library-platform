import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'noxsha_admin_session';
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for admin authentication.');
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
}

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function createSessionToken(payload: AdminSession) {
  return jwt.sign(payload, AUTH_SECRET as string, { expiresIn: SESSION_MAX_AGE });
}

export function verifySessionToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, AUTH_SECRET as string) as AdminSession;
  } catch (err) {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest): AdminSession | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionFromCookies(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(response: NextResponse, session: AdminSession) {
  const token = createSessionToken(session);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
}
