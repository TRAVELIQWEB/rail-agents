import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getGlobalVariableRecords, WHATSAPP_SETTINGS_CACHE_TAG } from "./global-variables";
import { GlobalVariableKey } from "@/models/global-variable.schema";
import type { WhatsAppSettings } from "./whatsapp";

async function readSettings() {
  const records = await getGlobalVariableRecords([GlobalVariableKey.WHATSAPP_NUMBER, GlobalVariableKey.WHATSAPP_MESSAGE]);
  if (records.filter((record) => record.key === GlobalVariableKey.WHATSAPP_NUMBER).length > 1 ||
      records.filter((record) => record.key === GlobalVariableKey.WHATSAPP_MESSAGE).length > 1) {
    throw new Error("Duplicate WhatsApp Global Variables require explicit resolution.");
  }
  const number = records.find((record) => record.key === GlobalVariableKey.WHATSAPP_NUMBER);
  const message = records.find((record) => record.key === GlobalVariableKey.WHATSAPP_MESSAGE);
  return { number, message };
}

// Admin reads are uncached and retain inactive values for editing.
export async function getWhatsAppSettingsForAdmin(): Promise<WhatsAppSettings> {
  const { number, message } = await readSettings();
  return {
    number: typeof number?.value === "string" ? number.value : "",
    message: typeof message?.value === "string" ? message.value : "",
    enabled: number?.status === true,
  };
}

async function loadWhatsAppSettings(): Promise<WhatsAppSettings> {
  try {
    const { number, message } = await readSettings();
    const complete = typeof number?.value === "string" && /^[1-9]\d{7,14}$/.test(number.value) &&
      typeof message?.value === "string" && message.value.length <= 1000;
    // The number status alone controls visibility. Incomplete configuration
    // disables CTAs; there is no legacy or hardcoded contact fallback.
    return { number: complete ? number.value : "", message: complete ? message.value : "", enabled: complete && number.status === true };
  } catch {
    return { number: "", message: "", enabled: false };
  }
}

export const getWhatsAppSettings = cache(unstable_cache(
  loadWhatsAppSettings,
  ["whatsapp-global-variables-v1"],
  { revalidate: 60, tags: [WHATSAPP_SETTINGS_CACHE_TAG] },
));
