import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/** List all slides (admin) sorted by sortOrder */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const slides = await ctx.db.query("slides").collect();
    const sorted = slides.sort((a, b) => a.sortOrder - b.sortOrder);

    // Resolve image URLs
    return Promise.all(
      sorted.map(async (slide) => {
        let resolvedImageUrl = slide.imageUrl ?? null;
        if (slide.imageId) {
          resolvedImageUrl = await ctx.storage.getUrl(slide.imageId);
        }
        return { ...slide, resolvedImageUrl };
      })
    );
  },
});

/** List active slides only (public) */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const slides = await ctx.db.query("slides").collect();
    const active = slides
      .filter((s) => s.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return Promise.all(
      active.map(async (slide) => {
        let resolvedImageUrl = slide.imageUrl ?? null;
        if (slide.imageId) {
          resolvedImageUrl = await ctx.storage.getUrl(slide.imageId);
        }
        return { ...slide, resolvedImageUrl };
      })
    );
  },
});

/** Create a new slide */
export const create = mutation({
  args: {
    title: v.string(),
    subtitle: v.string(),
    description: v.string(),
    link: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("slides", {
      ...args,
      active: true,
    });
  },
});

/** Update a slide */
export const update = mutation({
  args: {
    id: v.id("slides"),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // Remove undefined fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

/** Delete a slide */
export const remove = mutation({
  args: { id: v.id("slides") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/** Reorder slides */
export const reorder = mutation({
  args: {
    orderedIds: v.array(v.id("slides")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { sortOrder: i + 1 });
    }
  },
});
