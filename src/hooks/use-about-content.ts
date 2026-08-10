import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";

// Default texts for the About/Contact page
const DEFAULTS: Record<string, string> = {
  about_hero_title: "Hai pe la noi",
  about_hero_subtitle: "Suntem pe DN 68, la Totești — o pauză caldă pe drumul spre Hațeg. Te așteptăm cu drag!",
  about_story_title: "Povestea Metanoia",
  about_story_text: "Metanoia înseamnă transformare — o schimbare profundă a felului în care vezi lucrurile. Am deschis acest loc pe DN 68 cu dorința de a oferi călătorilor și localnicilor o experiență autentică: gusturi de casă, ingrediente locale și o atmosferă caldă.",
  about_story_subtitle: "Mai mult decât o băcănie",
  about_story_p1: "Am pornit de la ideea că drumul spre Hațeg merită o oprire specială. Nu doar un coffee-to-go, ci o experiență — sandwich-uri calde din ingrediente premium, cafea Nespresso, sucuri proaspăt stoarse și bunătățile din borcane pregătite după rețetele familiei.",
  about_story_p2: "Fiecare produs spune o poveste: a bunicii care ne-a învățat rețeta de zacuscă, a grădinilor din Țara Hațegului de unde vin legumele, a mâinilor care pregătesc totul cu grijă în fiecare dimineață.",
  about_quote: "Metanoia — acolo unde sufletul se odihnește și stomacul e fericit.",
  about_quote_author: "— Hațeg Alternativ · DN 68 · Totești",
};

export type AboutContent = Record<string, string>;

/**
 * Returns About page content merged with defaults.
 */
export function useAboutContent(): AboutContent {
  const items = useQuery(api.cms.listSiteContent, {});

  if (!items) return DEFAULTS;

  const merged = { ...DEFAULTS };
  for (const item of items) {
    if (item.key.startsWith("about_") && item.value.trim()) {
      merged[item.key] = item.value;
    }
  }
  return merged;
}
