import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

// Default values (hardcoded fallbacks)
const DEFAULTS: Record<string, string> = {
  address: "DN 68, Totești, Județul Hunedoara",
  phone: "+40 749 229 686",
  email: "hategalternativ@gmail.com",
  whatsapp: "40749229686",
  instagram: "https://www.instagram.com/metanoia.hateg/",
  facebook: "https://www.facebook.com/metanoia.hateg",
  companyName: "DAKAMIGOS MARKT SRL",
  cui: "38324829",
  regCom: "J2017001477205",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2790.4!2d22.9256!3d45.6217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x474ea07e5e8a9c33%3A0x3b2e4f7c8d9a1e56!2sTote%C8%99ti%2C%20Hunedoara!5e0!3m2!1sro!2sro!4v1700000000000!5m2!1sro!2sro",
};

export type SiteInfo = Record<string, string>;

/**
 * Returns site info merged with defaults.
 * While loading, returns defaults so the UI never shows blank.
 */
export function useSiteInfo(): SiteInfo {
  const entries = useQuery(api.siteInfo.getAll, {});

  if (!entries) return DEFAULTS;

  const merged = { ...DEFAULTS };
  for (const entry of entries) {
    if (entry.value.trim()) {
      merged[entry.key] = entry.value;
    }
  }
  return merged;
}
