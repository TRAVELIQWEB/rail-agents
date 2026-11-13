export interface WhatsAppSettings {
  number: string;
  message: string;
  enabled: boolean;
}

// Omit the number only for sharing content with a recipient chosen by the user.
export function getWhatsAppUrl(message: string, number = ""): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
