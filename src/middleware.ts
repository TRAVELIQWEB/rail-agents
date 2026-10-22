import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secretPath = process.env.ADMIN_SECRET_PATH?.trim();
  const sessionCookie = request.cookies.get("railagents_admin_session");
  const hasSession = Boolean(sessionCookie?.value);

  // 1. Private Admin Entry URL (ADMIN_SECRET_PATH)
  // If configured and user visits this private entry point:
  if (secretPath && secretPath.startsWith("/") && pathname === secretPath) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    // Set a short-lived one-time access token cookie so the login page can be rendered
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.set("railagents_admin_entry", "authorized", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 300, // 5 minutes to submit login
      path: "/admin",
    });
    return response;
  }

  // 2. Direct visits to /admin/login
  if (pathname === "/admin/login") {
    // If already logged in, send to dashboard
    if (hasSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Require the private entry cookie set by the secret path
    const entryCookie = request.cookies.get("railagents_admin_entry");
    if (!entryCookie || entryCookie.value !== "authorized") {
      // Direct visit to /admin/login jumps to home page (same as dashboard)
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow login page to render only when coming through private entry
    return NextResponse.next();
  }

  // 3. Protected Admin Pages (/admin, /admin/dashboard, /admin/posts, etc.)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasSession) {
      // Unauthenticated visitor attempting to access dashboard or admin pages -> redirect to safe public page
      return NextResponse.redirect(new URL("/", request.url));
    }
    // If logged in and visiting bare /admin, go to dashboard
    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // 4. Protected Admin APIs (/api/admin/session, /api/upload)
  if (
    pathname === "/api/admin/session" ||
    pathname.startsWith("/api/upload")
  ) {
    if (!hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|apple-icon.png|icon.png).*)",
  ],
};
