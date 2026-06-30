import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── PUBLIC QUERIES ───

export const listPublished = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let posts;
    if (args.category) {
      posts = await ctx.db
        .query("blogPosts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
      posts = posts.filter((p) => p.published);
    } else {
      posts = await ctx.db
        .query("blogPosts")
        .withIndex("by_published", (q) => q.eq("published", true))
        .collect();
    }

    // Sort by publishedAt descending (newest first)
    posts.sort((a, b) => {
      const dateA = a.publishedAt ?? "";
      const dateB = b.publishedAt ?? "";
      return dateB.localeCompare(dateA);
    });

    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        coverImageUrl: post.coverImageId
          ? await ctx.storage.getUrl(post.coverImageId)
          : null,
      }))
    );
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!post || !post.published) return null;

    return {
      ...post,
      coverImageUrl: post.coverImageId
        ? await ctx.storage.getUrl(post.coverImageId)
        : null,
    };
  },
});

// ─── ADMIN QUERIES & MUTATIONS ───

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("blogPosts").collect();
    // Sort by sortOrder
    posts.sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        coverImageUrl: post.coverImageId
          ? await ctx.storage.getUrl(post.coverImageId)
          : null,
      }))
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    published: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const publishedAt = args.published
      ? new Date().toISOString()
      : undefined;

    return await ctx.db.insert("blogPosts", {
      ...args,
      publishedAt,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("blogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    published: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );

    // If being published for the first time, set publishedAt
    if (updates.published === true) {
      const existing = await ctx.db.get(id);
      if (existing && !existing.publishedAt) {
        Object.assign(filtered, { publishedAt: new Date().toISOString() });
      }
    }

    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (post?.coverImageId) {
      await ctx.storage.delete(post.coverImageId);
    }
    await ctx.db.delete(args.id);
  },
});
