import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin/dashboard")) {
    if (!req.auth || (req.auth.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/writer")) {
    if (!req.auth || (req.auth.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=/writer/comics", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/writer/:path*"],
};
