const availableInternalRoutes = new Set([
  "/",
  "/ask-nihal",
  "/contact",
  "/about",
  "/irctc-agent-registration",
  "/irctc-agent-rules-regulations",
  "/fare-calculator",
  "/train-ticket-agent-fare-calculator",
  "/videos",
  "/guides",
  "/blog",
  "/admin",
  "/admin/login",
  "/admin/dashboard",
  "/admin/posts",
  "/admin/posts/new",
]);

export function isInternalRouteAvailable(href: string) {
  const pathname = href.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  if (availableInternalRoutes.has(pathname)) return true;
  if (pathname.startsWith("/blog/") || pathname.startsWith("/guides/") || pathname.startsWith("/admin/")) {
    return true;
  }
  return false;
}
