
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawSecretPath =
    process.env.ADMIN_SECRET_PATH ||
    (process.env.ADMIN_ENTRY_SECRET?.startsWith("/")
      ? process.env.ADMIN_ENTRY_SECRET
      : undefined);
  const secretPath = rawSecretPath?.trim();
  const sessionCookie = request.cookies.get("railagents_admin_session");
  const hasSession = Boolean(sessionCookie?.value);

  // 1. Private admin entry URL alias (if configured)
  if (secretPath && secretPath.startsWith("/") && pathname === secretPath) {
    if (hasSession) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  // 2. Login page: direct access permitted
  if (pathname === "/admin/login") {
    if (hasSession) {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }
    return NextResponse.next();
  }

  // 3. Admin protected pages (/admin, /admin/dashboard, /admin/posts, etc.)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasSession) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }

    if (pathname === "/admin") {
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }
  }

  // 4. Pass through all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|apple-icon.png|icon.png).*)",
  ],
};
