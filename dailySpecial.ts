import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get the active daily special
export const get = query({
  args: {},
  handler: async (ctx) => {
    const specials = await ctx.db.query("dailySpecial").collect();
    const active = specials.find((s) => s.active);
    if (!active) return null;
    return {
      ...active,
      imageUrl: active.imageId ? await ctx.storage.getUrl(active.imageId) : null,
    };
  },
});

// Get all specials (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const specials = await ctx.db.query("dailySpecial").order("desc").collect();
    return Promise.all(
      specials.map(async (s) => ({
        ...s,
        imageUrl: s.imageId ? await ctx.storage.getUrl(s.imageId) : null,
      }))
    );
  },
});

// Create or update daily special
export const upsert = mutation({
  args: {
    id: v.optional(v.id("dailySpecial")),
    title: v.string(),
    description: v.string(),
    originalPrice: v.optional(v.number()),
    discountPrice: v.optional(v.number()),
    badge: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;

    if (id) {
      // Update existing
      await ctx.db.patch(id, data);
      return id;
    }

    // If activating, deactivate all others
    if (data.active) {
      const allSpecials = await ctx.db.query("dailySpecial").collect();
      for (const s of allSpecials) {
        if (s.active) {
          await ctx.db.patch(s._id, { active: false });
        }
      }
    }

    return await ctx.db.insert("dailySpecial", data);
  },
});

// Toggle active state (deactivates all others when activating one)
export const setActive = mutation({
  args: { id: v.id("dailySpecial"), active: v.boolean() },
  handler: async (ctx, args) => {
    if (args.active) {
      // Deactivate all others
      const allSpecials = await ctx.db.query("dailySpecial").collect();
      for (const s of allSpecials) {
        if (s.active && s._id !== args.id) {
          await ctx.db.patch(s._id, { active: false });
        }
      }
    }
    await ctx.db.patch(args.id, { active: args.active });
  },
});

// Delete a daily special
export const remove = mutation({
  args: { id: v.id("dailySpecial") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item?.imageId) {
      await ctx.storage.delete(item.imageId);
    }
    await ctx.db.delete(args.id);
  },
});
