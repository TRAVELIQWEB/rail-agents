import { notFound, permanentRedirect } from "next/navigation";
import { railTools } from "@/config/tools";
import { legacyToolDestination, type ToolSearchParams } from "@/lib/tool-navigation";

export default async function LegacyToolPage({ params, searchParams }: {
  params: Promise<{ tool: string }>;
  searchParams: Promise<ToolSearchParams>;
}) {
  const { tool } = await params;
  if (!railTools.some((item) => item.href === '/' + tool)) notFound();
  permanentRedirect(legacyToolDestination(await searchParams, tool));
}
