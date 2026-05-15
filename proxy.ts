import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { routing } from './i18n/routing';

// Middleware i18n de next-intl (gère le préfixe de langue dans l'URL)
const intlMiddleware = createMiddleware(routing);

// Même secret que lib/jwt.ts, encodé pour l'API Web Crypto (Edge-compatible)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-secret-jwt-super-securise'
);

const LOCALES = ['en', 'fr', 'ar'] as const;

// Routes accessibles sans être connecté
const PUBLIC_PATHS = ['/', '/login', '/register'];

function getLocaleAndPath(pathname: string) {
  for (const locale of LOCALES) {
    if (pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) };
    }
    if (pathname === `/${locale}`) {
      return { locale, path: '/' };
    }
  }
  return { locale: 'en', path: pathname };
}

async function isTokenValid(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Les routes /api gèrent leur propre auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const { locale, path } = getLocaleAndPath(pathname);
  const token = request.cookies.get('auth-token')?.value;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));

  if (!isPublic) {
    // Route protégée : redirige vers login si pas de token valide
    if (!token || !(await isTokenValid(token))) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  } else if (token && (await isTokenValid(token))) {
    // Déjà connecté : redirige vers categories si on tente d'accéder à login/register
    const isAuthPage = path === '/login' || path === '/register';
    if (isAuthPage) {
      return NextResponse.redirect(new URL(`/${locale}/categories`, request.url));
    }
  }

  // Laisse next-intl gérer le reste (locale prefix, redirections langue)
  return intlMiddleware(request);
}

export const config = {
  // Exclut les fichiers statiques, images et internals Next.js
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
