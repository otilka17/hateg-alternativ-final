import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Public: list active partners
export const list = query({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db.query("partners").collect();
    const active = partners.filter((p) => p.active);
    active.sort((a, b) => a.sortOrder - b.sortOrder);

    return await Promise.all(
      active.map(async (p) => ({
        ...p,
        logoUrl: p.logoImageId ? await ctx.storage.getUrl(p.logoImageId) : null,
        coverUrl: p.coverImageId ? await ctx.storage.getUrl(p.coverImageId) : null,
      }))
    );
  },
});

// Public: list featured partners (for homepage)
export const listFeatured = query({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db.query("partners").collect();
    const featured = partners.filter((p) => p.active && p.featured);
    featured.sort((a, b) => a.sortOrder - b.sortOrder);

    return await Promise.all(
      featured.map(async (p) => ({
        ...p,
        logoUrl: p.logoImageId ? await ctx.storage.getUrl(p.logoImageId) : null,
        coverUrl: p.coverImageId ? await ctx.storage.getUrl(p.coverImageId) : null,
      }))
    );
  },
});

// Admin: list all partners
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Nu ești autentificat", code: "UNAUTHENTICATED" });
    }
    const partners = await ctx.db.query("partners").collect();
    partners.sort((a, b) => a.sortOrder - b.sortOrder);

    return await Promise.all(
      partners.map(async (p) => ({
        ...p,
        logoUrl: p.logoImageId ? await ctx.storage.getUrl(p.logoImageId) : null,
        coverUrl: p.coverImageId ? await ctx.storage.getUrl(p.coverImageId) : null,
      }))
    );
  },
});

// Admin: create partner
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
    logoImageId: v.optional(v.id("_storage")),
    coverImageId: v.optional(v.id("_storage")),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Nu ești autentificat", code: "UNAUTHENTICATED" });
    }
    const all = await ctx.db.query("partners").collect();
    const sortOrder = all.length;

    return await ctx.db.insert("partners", {
      name: args.name,
      description: args.description,
      website: args.website,
      logoImageId: args.logoImageId,
      coverImageId: args.coverImageId,
      featured: args.featured,
      sortOrder,
      active: true,
    });
  },
});

// Admin: update partner
export const update = mutation({
  args: {
    id: v.id("partners"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logoImageId: v.optional(v.id("_storage")),
    coverImageId: v.optional(v.id("_storage")),
    featured: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Nu ești autentificat", code: "UNAUTHENTICATED" });
    }
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new ConvexError({ message: "Partenerul nu a fost găsit", code: "NOT_FOUND" });
    }

    const updates: Record<string, unknown> = {};
    if (fields.name !== undefined) updates.name = fields.name;
    if (fields.description !== undefined) updates.description = fields.description;
    if (fields.website !== undefined) updates.website = fields.website;
    if (fields.logoImageId !== undefined) updates.logoImageId = fields.logoImageId;
    if (fields.coverImageId !== undefined) updates.coverImageId = fields.coverImageId;
    if (fields.featured !== undefined) updates.featured = fields.featured;
    if (fields.active !== undefined) updates.active = fields.active;

    await ctx.db.patch(id, updates);
  },
});

// Admin: remove partner
export const remove = mutation({
  args: { id: v.id("partners") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Nu ești autentificat", code: "UNAUTHENTICATED" });
    }
    await ctx.db.delete(args.id);
  },
});

// Generate upload URL for partner images
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Nu ești autentificat", code: "UNAUTHENTICATED" });
    }
    return await ctx.storage.generateUploadUrl();
  },
});
