// Iron-session configuration for RailAgents admin auth
import { getIronSession, type CookieStore, type SessionOptions } from "iron-session";

export interface AdminSession {
  isLoggedIn: boolean;
  email: string;
  sessionVersion: number;
}
export function isAdminUiPreviewEnabled() {
  return process.env.NODE_ENV === "development" && process.env.ADMIN_UI_PREVIEW === "true";
}

export const sessionOptions: SessionOptions = {
  password: (() => {
    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error(
        "SESSION_SECRET must be configured and at least 32 characters long."
      );
    }

    return secret;
  })(),
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

