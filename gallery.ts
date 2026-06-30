import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── GALLERY IMAGES ───

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let items;
    if (args.category) {
      items = await ctx.db
        .query("galleryImages")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      items = await ctx.db.query("galleryImages").collect();
    }
    // Only return active items, sorted by sortOrder
    const active = items.filter((i) => i.active).sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.all(
      active.map(async (item) => ({
        ...item,
        imageUrl: await ctx.storage.getUrl(item.imageId),
      }))
    );
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("galleryImages").collect();
    const sorted = items.sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.all(
      sorted.map(async (item) => ({
        ...item,
        imageUrl: await ctx.storage.getUrl(item.imageId),
      }))
    );
  },
});

export const create = mutation({
  args: {
    alt: v.string(),
    category: v.string(),
    imageId: v.id("_storage"),
    span: v.optional(v.union(v.literal("tall"), v.literal("wide"))),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("galleryImages", {
      ...args,
      active: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("galleryImages"),
    alt: v.optional(v.string()),
    category: v.optional(v.string()),
    span: v.optional(v.union(v.literal("tall"), v.literal("wide"), v.null())),
    sortOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { id, span, ...rest } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(rest)) {
      if (val !== undefined) updates[key] = val;
    }
    // Handle span separately (allow setting to undefined via null)
    if (span === null) {
      updates.span = undefined;
    } else if (span !== undefined) {
      updates.span = span;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("galleryImages") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item?.imageId) {
      await ctx.storage.delete(item.imageId);
    }
    await ctx.db.delete(args.id);
  },
});
