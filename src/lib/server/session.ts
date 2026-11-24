import 'server-only';

import { jwtVerify, SignJWT } from 'jose';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'session';
const MAX_AGE_DAYS = 30;

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET орчны хувьсагч алга эсвэл 32 тэмдэгтээс богино байна (локал: .env.local, Vercel: Settings → Environment Variables)'
    );
  }
  return new TextEncoder().encode(secret);
}

export function assertSessionConfigured() {
  key();
}

export async function encrypt(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_DAYS}d`)
    .sign(key());
}

/** Cookie-ийн токеныг шалгаж хэрэглэгчийн id-г буцаана. Хүчингүй бол null. */
export async function decrypt(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, await encrypt(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Нэвтэрсэн хэрэглэгчийн ObjectId, эсвэл null. */
export async function currentUserId(): Promise<ObjectId | null> {
  const id = await decrypt((await cookies()).get(SESSION_COOKIE)?.value);
  return id && ObjectId.isValid(id) ? new ObjectId(id) : null;
}
