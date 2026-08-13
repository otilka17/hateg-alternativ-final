"use node";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const RAW_BASE =
  "https://raw.githubusercontent.com/otilka17/hateg-alternativ-final/claude/verifica-repo-ul-vbs9d5/public/images/borcane";

const BORCANE_IMAGES: Record<string, string> = {
  "Zacuscă Metanoia": `${RAW_BASE}/zacusca.webp`,
  "Bulion de grădină": `${RAW_BASE}/bulion.webp`,
};

export const patchBorcaneImages = internalAction({
  args: {},
  handler: async (ctx) => {
    for (const [name, url] of Object.entries(BORCANE_IMAGES)) {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed to fetch ${url}: ${res.status}`);
        continue;
      }
      const blob = await res.blob();
      const storageId = await ctx.storage.store(blob);
      await ctx.runMutation(internal.seedImagesMutations.setBorcaneImage, { name, storageId });
    }
  },
});
