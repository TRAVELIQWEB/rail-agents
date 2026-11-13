import "server-only";

import { GlobalVariableKey } from "@/models/global-variable.schema";

interface GlobalVariableDefinition {
  readonly label: string;
  readonly description: string;
  readonly inputType: "tel" | "email" | "textarea" | "url";
  readonly statusControlledBy?: GlobalVariableKey;
  readonly validation: {
    readonly allowEmpty: true;
    readonly maxLength: number;
    readonly isValid?: (value: string) => boolean;
    readonly message?: string;
  };
}

function isSocialUrl(value: string, domain: string) {
  try {
    const url = new URL(value);
    return value === value.trim() && url.protocol === "https:" &&
      (url.hostname === domain || url.hostname === `www.${domain}`) &&
      !url.username && !url.password && !url.port;
  } catch { return false; }
}

export const globalVariableRegistry: Readonly<Record<GlobalVariableKey, GlobalVariableDefinition>> = Object.freeze({
  [GlobalVariableKey.WHATSAPP_NUMBER]: {
    label: "WhatsApp Number",
    description: "WhatsApp number including country code, using digits only.",
    inputType: "tel",
    validation: {
      allowEmpty: true,
      maxLength: 15,
      isValid: (value) => /^[1-9]\d{7,14}$/.test(value),
      message: "Use 8–15 digits including the country code, without +, spaces or a leading zero.",
    },
  },
  [GlobalVariableKey.WHATSAPP_MESSAGE]: {
    label: "WhatsApp Message",
    description: "Default message for WhatsApp contact links.",
    inputType: "textarea",
    statusControlledBy: GlobalVariableKey.WHATSAPP_NUMBER,
    validation: { allowEmpty: true, maxLength: 1000 },
  },
  [GlobalVariableKey.CONTACT_PHONE]: {
    label: "Contact Phone",
    description: "International contact phone number, with an optional leading +.",
    inputType: "tel",
    validation: {
      allowEmpty: true,
      maxLength: 16,
      isValid: (value) => /^\+?[1-9]\d{7,14}$/.test(value),
      message: "Use 8–15 digits including the country code, optionally prefixed by +.",
    },
  },
  [GlobalVariableKey.CONTACT_EMAIL]: {
    label: "Contact Email",
    description: "Public contact email address.",
    inputType: "email",
    validation: {
      allowEmpty: true,
      maxLength: 254,
      isValid: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Enter a valid email address.",
    },
  },
  [GlobalVariableKey.OFFICE_ADDRESS]: {
    label: "Office Address",
    description: "Public office or correspondence address.",
    inputType: "textarea",
    validation: { allowEmpty: true, maxLength: 2000 },
  },
  [GlobalVariableKey.INSTAGRAM_URL]: {
    label: "Instagram URL",
    description: "Public Instagram profile URL.",
    inputType: "url",
    validation: {
      allowEmpty: true,
      maxLength: 2048,
      isValid: (value) => isSocialUrl(value, "instagram.com"),
      message: "Enter an HTTPS URL on instagram.com or www.instagram.com.",
    },
  },
  [GlobalVariableKey.YOUTUBE_URL]: {
    label: "YouTube URL",
    description: "Public RailAgents YouTube channel URL.",
    inputType: "url",
    validation: {
      allowEmpty: true, maxLength: 2048,
      isValid: (value) => isSocialUrl(value, "youtube.com"),
      message: "Enter an HTTPS URL on youtube.com or www.youtube.com.",
    },
  },
  [GlobalVariableKey.FACEBOOK_URL]: {
    label: "Facebook URL",
    description: "Public RailAgents Facebook page URL.",
    inputType: "url",
    validation: {
      allowEmpty: true, maxLength: 2048,
      isValid: (value) => isSocialUrl(value, "facebook.com"),
      message: "Enter an HTTPS URL on facebook.com or www.facebook.com.",
    },
  },
});

export function assertGlobalVariableKey(key: unknown): asserts key is GlobalVariableKey {
  if (typeof key !== "string" || !Object.prototype.hasOwnProperty.call(globalVariableRegistry, key)) {
    throw new Error("Unknown global variable key.");
  }
}

export function validateGlobalVariableInput(
  key: GlobalVariableKey,
  value: string,
  desc: string,
  status: boolean,
): void {
  assertGlobalVariableKey(key);
  const definition = globalVariableRegistry[key];
  if (typeof value !== "string") throw new Error("Global variable value must be a string.");
  if (typeof desc !== "string" || desc.length > 1000) {
    throw new Error("Description must be a string of at most 1,000 characters.");
  }
  if (typeof status !== "boolean") throw new Error("Global variable status must be a boolean.");
  if (value.length > definition.validation.maxLength) {
    throw new Error(`${definition.label} must be at most ${definition.validation.maxLength} characters.`);
  }
  if (value !== "" && definition.validation.isValid && !definition.validation.isValid(value)) {
    throw new Error(definition.validation.message);
  }
}
