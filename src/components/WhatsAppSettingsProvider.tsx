"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";

import { getWhatsAppUrl, type WhatsAppSettings } from "@/lib/whatsapp";

const WhatsAppContext = createContext<WhatsAppSettings | null>(null);

export function WhatsAppSettingsProvider({ settings, children }: {
  settings: WhatsAppSettings;
  children: ReactNode;
}) {
  return <WhatsAppContext.Provider value={settings}>{children}</WhatsAppContext.Provider>;
}

export function useWhatsAppSettings() {
  const settings = useContext(WhatsAppContext);
  if (!settings) throw new Error("WhatsAppSettingsProvider is required");
  return settings;
}

export function WhatsAppLink({ contextMessage, ...props }: Omit<ComponentProps<"a">, "href"> & {
  contextMessage?: string;
}) {
  const settings = useWhatsAppSettings();
  if (!settings.enabled) return null;
  const message = [settings.message, contextMessage].filter(Boolean).join("\n\n");
  return <a {...props} href={getWhatsAppUrl(message, settings.number)} />;
}

