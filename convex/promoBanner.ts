import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const banners = await ctx.db.query("promoBanner").collect();
    // Return the first (and only) banner document, or null
    return banners[0] ?? null;
  },
});

export const upsert = mutation({
  args: {
    text: v.string(),
    active: v.boolean(),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("promoBanner").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        text: args.text,
        active: args.active,
        emoji: args.emoji,
      });
      return existing._id;
    }
    return await ctx.db.insert("promoBanner", {
      text: args.text,
      active: args.active,
      emoji: args.emoji,
    });
  },
});
