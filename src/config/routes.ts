const availableInternalRoutes = new Set([
  "/",
  "/ask-nihal",
  "/contact",
  "/about",
  "/irctc-agent-registration",
  "/videos",
  "/guides",
]);

export function isInternalRouteAvailable(href: string) {
  const pathname = href.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  return availableInternalRoutes.has(pathname);
}
