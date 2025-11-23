import { NextResponse } from "next/server";
import { validateUserCookie, sanitizePath, checkRateLimit, getSecurityHeaders, logSecurityEvent } from "@/lib/security";

export function middleware(req) {
  const pathname = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
  
  // Sanitize path untuk mencegah path traversal
  // Hanya block jika benar-benar berbahaya
  const sanitizedPath = sanitizePath(pathname);
  if (sanitizedPath === null) {
    logSecurityEvent("PATH_TRAVERSAL_ATTEMPT", { pathname, ip }, req);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Rate limiting - hanya untuk route yang perlu proteksi
  // Skip rate limiting untuk static assets dan route umum
  const needsRateLimit = pathname.startsWith("/dashboard") || 
                         pathname.startsWith("/api/dashboard") ||
                         pathname.startsWith("/api/protected");
  
  if (needsRateLimit) {
    const rateLimit = checkRateLimit(ip, 60, 60000); // 60 requests per minute (lebih longgar)
    if (!rateLimit.allowed) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { ip, pathname }, req);
      return new NextResponse("Too Many Requests", { 
        status: 429,
        headers: {
          "Retry-After": "60",
          ...getSecurityHeaders(),
        },
      });
    }
  }

  // Validasi cookie user dengan security checks
  const userCookie = req.cookies.get("user")?.value;
  let user = null;

  if (userCookie) {
    try {
      user = validateUserCookie(userCookie);
      
      // Jika cookie tidak valid, hanya redirect jika mencoba akses protected route
      // Jangan hapus cookie di sini, biarkan client-side handle
      if (!user) {
        // Hanya log jika mencoba akses dashboard
        if (pathname.startsWith("/dashboard")) {
          logSecurityEvent("INVALID_COOKIE", { ip, pathname }, req);
        }
        // Set user ke null, akan di-handle di bawah
        user = null;
      }
    } catch (error) {
      // Jika parsing error, log tapi jangan block semua request
      if (pathname.startsWith("/dashboard")) {
        logSecurityEvent("COOKIE_PARSE_ERROR", { ip, pathname, error: error.message }, req);
      }
      user = null;
    }
  }

  // Proteksi route dashboard
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isDashboardUserRoute = pathname.startsWith("/dashboard-user");

  // Jika belum login dan mencoba akses dashboard → redirect ke login
  if (!user && (isDashboardRoute || isDashboardUserRoute)) {
    logSecurityEvent("UNAUTHORIZED_ACCESS", { ip, pathname }, req);
    const response = NextResponse.redirect(new URL("/login", req.url));
    // Hapus cookie yang tidak valid
    response.cookies.delete("user");
    Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
      if (value) response.headers.set(key, value);
    });
    return response;
  }

  // Role-based access control (RBAC)
  if (user) {
    // Admin mencoba akses dashboard-user → redirect ke dashboard admin
    if (user.role === "admin" && isDashboardUserRoute) {
      logSecurityEvent("ROLE_VIOLATION", { 
        ip, 
        pathname, 
        userRole: user.role, 
        attemptedRoute: "dashboard-user" 
      }, req);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // User biasa mencoba akses dashboard admin → redirect ke dashboard user
    if (user.role === "user" && isDashboardRoute && !isDashboardUserRoute) {
      logSecurityEvent("ROLE_VIOLATION", { 
        ip, 
        pathname, 
        userRole: user.role, 
        attemptedRoute: "dashboard-admin" 
      }, req);
      return NextResponse.redirect(new URL("/dashboard-user", req.url));
    }
  }

  // Tambahkan security headers ke response
  const response = NextResponse.next();
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  // Tambahkan rate limit info ke header jika ada
  if (needsRateLimit) {
    const rateLimit = checkRateLimit(ip, 60, 60000);
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(Date.now() + 60000).toISOString());
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard-user/:path*",
    "/api/dashboard/:path*",
    "/api/protected/:path*",
  ],
};
