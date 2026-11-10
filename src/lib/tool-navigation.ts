import { findRailTool } from "@/config/tools";

export type ToolSearchParams = Record<string, string | string[] | undefined>;

export function legacyToolDestination(params: ToolSearchParams, slug?: string) {
  const raw = slug ?? params.tool;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const tool = findRailTool(value || (params.pnr || params.lookup ? "pnr" : null));
  if (!tool) return "/tools";
  const query = new URLSearchParams();
  const supported = tool.id === "pnr" ? ["pnr", "lookup"] : tool.id === "live-train" ? ["train", "date"] : [];
  for (const key of supported) {
    const value = params[key];
    if (typeof value === "string") query.set(key, value);
  }
  return `${tool.href}${query.size ? `?${query}` : ""}`;
}
