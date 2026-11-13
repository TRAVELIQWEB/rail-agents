import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { isAdminUiPreviewEnabled, sessionOptions, type AdminSession } from "@/lib/auth";
import { isAdminSessionValid } from "@/lib/admin-session-validation";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawSecretPath =
    process.env.ADMIN_SECRET_PATH ||
    (process.env.ADMIN_ENTRY_SECRET?.startsWith("/")
      ? process.env.ADMIN_ENTRY_SECRET
      : undefined);
  const secretPath = rawSecretPath?.trim();
  const isSecretEntry = Boolean(secretPath?.startsWith("/") && pathname === secretPath);
  if (!isSecretEntry && pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(sessionOptions.cookieName);
  let hasSession = isAdminUiPreviewEnabled();
  if (!hasSession && sessionCookie?.value) {
    try {
      const session = await unsealData<{ admin?: AdminSession }>(sessionCookie.value, {
        password: sessionOptions.password,
        ttl: sessionOptions.ttl,
      });
      hasSession = await isAdminSessionValid(session.admin);
    } catch {
      // Malformed, expired and undecryptable cookies are unauthenticated.
    }
  }

  function finish(response: NextResponse) {
    if (!hasSession && sessionCookie) {
      response.cookies.set(sessionOptions.cookieName, "", {
        ...sessionOptions.cookieOptions,
        path: "/",
        maxAge: 0,
      });
    }
    return response;
  }

  // Private admin entry URL alias (when configured).
  if (isSecretEntry) {
    return finish(NextResponse.redirect(
      new URL(hasSession ? "/admin/dashboard" : "/admin/login", request.url),
    ));
  }

  // Allow the login page, redirecting an active session to the dashboard.
  if (pathname === "/admin/login") {
    return finish(hasSession
      ? NextResponse.redirect(new URL("/admin/dashboard", request.url))
      : NextResponse.next());
  }

  // Protect admin pages and keep the dashboard as the admin landing page.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasSession) {
      return finish(NextResponse.redirect(new URL("/admin/login", request.url)));
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
