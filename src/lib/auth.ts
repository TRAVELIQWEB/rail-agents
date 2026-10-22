// Iron-session configuration for RailAgents admin auth
import { getIronSession, type CookieStore, type SessionOptions } from "iron-session";

export interface AdminSession {
  isLoggedIn: boolean;
  email: string;
}

export function isAdminUiPreviewEnabled() {
  return process.env.NODE_ENV === "development" && process.env.ADMIN_UI_PREVIEW === "true";
}

export const sessionOptions: SessionOptions = {
  password:
    (process.env.SESSION_SECRET ||
      process.env.ADMIN_SESSION_PASSWORD ||
      "railagents_default_development_secret_must_be_at_least_32_characters_long") as string,
  cookieName: "railagents_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export function getAdminIronSession(cookieStore: CookieStore) {
  return getIronSession<{ admin?: AdminSession }>(cookieStore, sessionOptions);
}

