import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getWhatsAppSettings } from "@/lib/whatsapp-settings";
import type { WhatsAppSettings } from "@/lib/whatsapp";

export async function FloatingWhatsAppServer({ settings: initialSettings }: {
  settings?: WhatsAppSettings;
}) {
  const settings = initialSettings ?? await getWhatsAppSettings();

  if (!settings.enabled) {
    return null;
  }

  return (
    <FloatingWhatsApp number={settings.number} message={settings.message} />
  );
}
