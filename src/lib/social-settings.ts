import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getGlobalVariables, SOCIAL_LINKS_CACHE_TAG } from "@/lib/global-variables";
import { validateGlobalVariableInput } from "@/lib/global-variable-registry";
import { GlobalVariableKey } from "@/models/global-variable.schema";
import type { SocialLinks } from "@/lib/social";

async function loadSocialLinks(): Promise<SocialLinks> {
  const links: SocialLinks = { youtube: null, instagram: null, facebook: null };
  const keys = { youtube: GlobalVariableKey.YOUTUBE_URL, instagram: GlobalVariableKey.INSTAGRAM_URL, facebook: GlobalVariableKey.FACEBOOK_URL };
  try {
    const values = await getGlobalVariables(Object.values(keys));
    for (const platform of Object.keys(keys) as (keyof SocialLinks)[]) {
      const value = values[keys[platform]];
      if (!value) continue;
      try {
        validateGlobalVariableInput(keys[platform], value, "", true);
        links[platform] = value;
      } catch { /* Hide invalid stored URLs without a fallback. */ }
    }
  } catch { /* Missing/unavailable configuration hides social contact links. */ }
  return links;
}

// Match the existing cache strategy without opting the whole site into dynamic rendering.
export const getSocialLinks = cache(unstable_cache(loadSocialLinks, ["global-social-links-v1"], {
  revalidate: 60, tags: [SOCIAL_LINKS_CACHE_TAG],
}));
