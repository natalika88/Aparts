import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "@/auth";
import { routing } from "./i18n/routing";
import { canAccessContent, canAccessPricing, defaultAdminHome } from "@/lib/auth/roles";
import type { UserRole } from "@/types/next-auth";

const intlMiddleware = createIntlMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return intlMiddleware(req);
  }

  const isLogin = pathname === "/admin/login";
  const session = req.auth;
  const role = session?.user?.role as UserRole | undefined;

  if (!session && !isLogin) {
    const url = new URL("/admin/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (session && isLogin) {
    return NextResponse.redirect(new URL(defaultAdminHome(role!), req.nextUrl));
  }

  if (pathname.startsWith("/admin/pricing") && role && !canAccessPricing(role)) {
    return NextResponse.redirect(new URL("/admin/content", req.nextUrl));
  }

  if (pathname.startsWith("/admin/content") && role && !canAccessContent(role)) {
    return NextResponse.redirect(new URL("/admin/pricing", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
