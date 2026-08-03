import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const roleForPath: Record<string, string> = {
  "/dashboard": "CUSTOMER",
  "/agent": "AGENT",
  "/admin": "ADMIN",
  "/callcenter": "CALL_CENTER",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = Object.keys(roleForPath).find((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!matchedPrefix) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requiredRole = roleForPath[matchedPrefix];
  if (token.role !== requiredRole) {
    // Logged in, but wrong portal for their role — send them to the right one.
    const redirectMap: Record<string, string> = {
      CUSTOMER: "/dashboard",
      AGENT: "/agent",
      ADMIN: "/admin",
      CALL_CENTER: "/callcenter",
    };
    const target = redirectMap[token.role as string] ?? "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/agent/:path*", "/admin/:path*", "/callcenter/:path*"],
};
