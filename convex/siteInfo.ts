import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all site info entries
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("siteInfo").collect();
  },
});

// Get a single site info entry by key
export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("siteInfo")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});

// Upsert a site info entry
export const upsert = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteInfo")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    }
    return await ctx.db.insert("siteInfo", {
      key: args.key,
      value: args.value,
    });
  },
});

// Bulk upsert multiple entries at once
export const bulkUpsert = mutation({
  args: {
    entries: v.array(v.object({
      key: v.string(),
      value: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    for (const entry of args.entries) {
      const existing = await ctx.db
        .query("siteInfo")
        .withIndex("by_key", (q) => q.eq("key", entry.key))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { value: entry.value });
      } else {
        await ctx.db.insert("siteInfo", {
          key: entry.key,
          value: entry.value,
        });
      }
    }
  },
});
