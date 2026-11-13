import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import clientPromise from "./mongodb";

import type { WhatsAppSettings } from "./whatsapp";

interface SiteSettings {
  _id: string;
  whatsapp: WhatsAppSettings;
}

async function loadWhatsAppSettings(): Promise<WhatsAppSettings> {
  const client = await clientPromise;

  const db = client.db("railagents");

  const settings = await db
    .collection<SiteSettings>("site_settings")
    .findOne({ _id: "global" });

  if (!settings?.whatsapp) {
    throw new Error("WhatsApp settings not found in MongoDB");
  }

  return {
    number: settings.whatsapp.number,
    message: settings.whatsapp.message,
    enabled: settings.whatsapp.enabled,
  };
}

// Revalidate static routes without making the root layout dynamic.
// Deduplicate calls within each server render as well.
export const getWhatsAppSettings = cache(unstable_cache(
  loadWhatsAppSettings,
  ["whatsapp-settings-global"],
  { revalidate: 60, tags: ["whatsapp-settings"] },
));
