import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawSecretPath =
    process.env.ADMIN_SECRET_PATH ||
    (process.env.ADMIN_ENTRY_SECRET?.startsWith("/")
      ? process.env.ADMIN_ENTRY_SECRET
      : undefined);
  const secretPath = rawSecretPath?.trim();
  const sessionCookie = request.cookies.get("railagents_admin_session");
  const hasSession = Boolean(sessionCookie?.value);

  // Private admin entry URL alias (when configured).
  if (secretPath && secretPath.startsWith("/") && pathname === secretPath) {
    return NextResponse.redirect(
      new URL(hasSession ? "/admin/dashboard" : "/admin/login", request.url),
    );
  }

  // Allow the login page, redirecting an active session to the dashboard.
  if (pathname === "/admin/login") {
    return hasSession
      ? NextResponse.redirect(new URL("/admin/dashboard", request.url))
      : NextResponse.next();
  }

  // Protect admin pages and keep the dashboard as the admin landing page.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|images|apple-icon.png|icon.png).*)",
  ],
};
