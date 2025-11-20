import { NextResponse } from "next/server";

export function middleware(req) {
  const userCookie = req.cookies.get("user")?.value;

  // Jika belum login → arahkan ke login
  if (!userCookie && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const user = userCookie ? JSON.parse(userCookie) : null;

  // Admin mencoba akses dashboard-user
  if (
    user &&
    user.role === "admin" &&
    req.nextUrl.pathname.startsWith("/dashboard-user")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // User biasa mencoba akses dashboard admin
  if (
    user &&
    user.role === "user" &&
    req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard-user", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard-user/:path*"],
};
