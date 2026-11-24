import { jwtVerify } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

// Proxy нь бусад модулиас хамааралгүй байх ёстой тул токен шалгалтыг энд шууд хийнэ.
async function isLoggedIn(token: string | undefined) {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

/** Нэвтрээгүй хэрэглэгчийг /login руу, нэвтэрсэн хэрэглэгчийг /login-оос нүүр рүү шилжүүлнэ. */
export async function proxy(req: NextRequest) {
  const loggedIn = await isLoggedIn(req.cookies.get('session')?.value);
  const isLogin = req.nextUrl.pathname === '/login';

  if (!loggedIn && !isLogin) return NextResponse.redirect(new URL('/login', req.url));
  if (loggedIn && isLogin) return NextResponse.redirect(new URL('/', req.url));
  return NextResponse.next();
}

export const config = {
  // API, Next-ийн дотоод файлууд, icon/manifest-ээс бусад бүх хуудсанд ажиллана.
  matcher: ['/((?!api|_next/static|_next/image|icon.svg|manifest.webmanifest|favicon.ico).*)'],
};
