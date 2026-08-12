"use node";

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";

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
      await ctx.runMutation(internal.seedImages.setBorcaneImage, { name, storageId });
    }
  },
});

export const setBorcaneImage = internalMutation({
  args: { name: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("borcaneItems")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    if (item) {
      await ctx.db.patch(item._id, { imageId: args.storageId });
    }
  },
});
