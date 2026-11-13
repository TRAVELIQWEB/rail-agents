import "server-only";

// NextURL normalizes loopback IPs to localhost. Compare against the actual Host
// authority, preserving scheme and port. Never treat loopback aliases as equal
// or trust client-supplied Forwarded/X-Forwarded-Host headers as an allowlist.
export function isSameOriginRequest(request: Request): boolean {
  try {
    const origin = request.headers.get("origin");
    if (!origin || !/^https?:\/\/[^\s/?#@,]+$/i.test(origin)) return false;
    const target = new URL(request.url);
    if (target.protocol !== "http:" && target.protocol !== "https:") return false;
    const host = request.headers.get("host") ?? target.host;
    if (!/^(?:[a-z\d.-]+|\[[a-f\d:.]+\])(?::\d+)?$/i.test(host)) return false;
    return new URL(origin).origin === new URL(`${target.protocol}//${host}`).origin;
  } catch { return false; }
}
