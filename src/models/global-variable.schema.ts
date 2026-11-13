export enum GlobalVariableKey {
  WHATSAPP_NUMBER = "WHATSAPP_NUMBER",
  WHATSAPP_MESSAGE = "WHATSAPP_MESSAGE",
  CONTACT_PHONE = "CONTACT_PHONE",
  CONTACT_EMAIL = "CONTACT_EMAIL",
  OFFICE_ADDRESS = "OFFICE_ADDRESS",
  INSTAGRAM_URL = "INSTAGRAM_URL",
  YOUTUBE_URL = "YOUTUBE_URL",
  FACEBOOK_URL = "FACEBOOK_URL",
}

export interface GlobalVariableDocument {
  key: GlobalVariableKey;
  value: string;
  desc: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
