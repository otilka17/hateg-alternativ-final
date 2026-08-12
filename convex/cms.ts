import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// ─── POPULAR ITEMS (for quick-order on homepage) ───
export const listPopularItems = query({
  args: {},
  handler: async (ctx) => {
    // Get a mix of popular sandwich + borcane items (active only, max 4)
    const sandwiches = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("category", "sandwich"))
      .collect();
    const activeSandwiches = sandwiches.filter((i) => i.active).slice(0, 2);

    const borcane = await ctx.db.query("borcaneItems").collect();
    const activeBorcane = borcane.filter((i) => i.active).slice(0, 2);

    const items = [
      ...await Promise.all(
        activeSandwiches.map(async (item) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
          badge: "Proaspăt zilnic" as const,
          category: "sandwich" as const,
        }))
      ),
      ...await Promise.all(
        activeBorcane.map(async (item) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
          badge: "Artizanal" as const,
          category: "borcane" as const,
        }))
      ),
    ];

    return items.slice(0, 4);
  },
});

// ─── MENU ITEMS ───

export const listMenuItems = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      const items = await ctx.db
        .query("menuItems")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
      // Resolve image URLs
      return Promise.all(
        items.map(async (item) => ({
          ...item,
          imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
        }))
      );
    }
    const items = await ctx.db.query("menuItems").collect();
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
    );
  },
});

export const createMenuItem = mutation({
  args: {
    category: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      ...args,
      active: true,
    });
  },
});

export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    clearImage: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, clearImage, ...updates } = args;
    const filtered: Record<string, unknown> = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    if (clearImage) {
      const item = await ctx.db.get(id);
      if (item?.imageId) await ctx.storage.delete(item.imageId);
      filtered.imageId = undefined;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const deleteMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item?.imageId) {
      await ctx.storage.delete(item.imageId);
    }
    await ctx.db.delete(args.id);
  },
});

// ─── BORCANE ITEMS ───

export const listBorcaneItems = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("borcaneItems").collect();
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
    );
  },
});

export const createBorcanItem = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    info: v.string(),
    price: v.number(),
    emoji: v.string(),
    tag: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("borcaneItems", {
      ...args,
      active: true,
    });
  },
});

export const updateBorcanItem = mutation({
  args: {
    id: v.id("borcaneItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    info: v.optional(v.string()),
    price: v.optional(v.number()),
    emoji: v.optional(v.string()),
    tag: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    clearImage: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, clearImage, ...updates } = args;
    const filtered: Record<string, unknown> = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    if (clearImage) {
      const item = await ctx.db.get(id);
      if (item?.imageId) await ctx.storage.delete(item.imageId);
      filtered.imageId = undefined;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const deleteBorcanItem = mutation({
  args: { id: v.id("borcaneItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item?.imageId) {
      await ctx.storage.delete(item.imageId);
    }
    await ctx.db.delete(args.id);
  },
});

// ─── PACHETE ITEMS ───

export const listPacheteItems = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("pacheteItems").collect();
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
    );
  },
});

export const createPachetItem = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    includes: v.array(v.string()),
    price: v.number(),
    emoji: v.string(),
    tag: v.optional(v.string()),
    saves: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pacheteItems", {
      ...args,
      active: true,
    });
  },
});

export const updatePachetItem = mutation({
  args: {
    id: v.id("pacheteItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    includes: v.optional(v.array(v.string())),
    price: v.optional(v.number()),
    emoji: v.optional(v.string()),
    tag: v.optional(v.string()),
    saves: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
    clearImage: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, clearImage, ...updates } = args;
    const filtered: Record<string, unknown> = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    if (clearImage) {
      const item = await ctx.db.get(id);
      if (item?.imageId) await ctx.storage.delete(item.imageId);
      filtered.imageId = undefined;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const deletePachetItem = mutation({
  args: { id: v.id("pacheteItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (item?.imageId) {
      await ctx.storage.delete(item.imageId);
    }
    await ctx.db.delete(args.id);
  },
});

// ─── SITE CONTENT ───

export const getSiteContent = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (!content) return null;
    return {
      ...content,
      imageUrl: content.imageId ? await ctx.storage.getUrl(content.imageId) : null,
    };
  },
});

export const listSiteContent = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("siteContent").collect();
    return Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
    );
  },
});

export const upsertSiteContent = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        ...(args.imageId !== undefined ? { imageId: args.imageId } : {}),
      });
      return existing._id;
    }
    return await ctx.db.insert("siteContent", {
      key: args.key,
      value: args.value,
      imageId: args.imageId,
    });
  },
});

// ─── SEED DATA (one-time import from hardcoded data) ───

export const seedMenuItems = mutation({
  args: {
    items: v.array(v.object({
      category: v.string(),
      name: v.string(),
      description: v.string(),
      price: v.number(),
      sortOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.insert("menuItems", {
        ...item,
        active: true,
      });
    }
  },
});

export const seedBorcaneItems = mutation({
  args: {
    items: v.array(v.object({
      name: v.string(),
      description: v.string(),
      info: v.string(),
      price: v.number(),
      emoji: v.string(),
      tag: v.optional(v.string()),
      sortOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.insert("borcaneItems", {
        ...item,
        active: true,
      });
    }
  },
});

export const seedPacheteItems = mutation({
  args: {
    items: v.array(v.object({
      name: v.string(),
      description: v.string(),
      includes: v.array(v.string()),
      price: v.number(),
      emoji: v.string(),
      tag: v.optional(v.string()),
      saves: v.optional(v.number()),
      sortOrder: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.insert("pacheteItems", {
        ...item,
        active: true,
      });
    }
  },
});
