import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const REACTION_EMOJIS = ["❤️", "👍", "😋", "🎉"] as const;

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

// ─── COMMENTS ───

export const listApprovedComments = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("blogComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    return comments
      .filter((c) => c.approved)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const submitComment = mutation({
  args: {
    postId: v.id("blogPosts"),
    name: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.name.trim()) {
      throw new ConvexError({ message: "Adaugă un nume", code: "BAD_REQUEST" });
    }
    if (args.text.trim().length < 3) {
      throw new ConvexError({ message: "Comentariul trebuie să aibă cel puțin 3 caractere", code: "BAD_REQUEST" });
    }
    await ctx.db.insert("blogComments", {
      postId: args.postId,
      name: args.name.trim(),
      text: args.text.trim(),
      approved: false,
    });
  },
});

// Admin: list all comments (pending + approved) across all posts
export const listAllComments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: "Trebuie să fii autentificat", code: "UNAUTHENTICATED" });
    }
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError({ message: "Acces restricționat", code: "FORBIDDEN" });
    }
    const comments = await ctx.db.query("blogComments").order("desc").collect();
    return Promise.all(
      comments.map(async (c) => {
        const post = await ctx.db.get(c.postId);
        return { ...c, postTitle: post?.title ?? "(articol șters)" };
      })
    );
  },
});

export const approveComment = mutation({
  args: { id: v.id("blogComments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: "Trebuie să fii autentificat", code: "UNAUTHENTICATED" });
    }
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError({ message: "Acces restricționat", code: "FORBIDDEN" });
    }
    await ctx.db.patch(args.id, { approved: true });
  },
});

export const removeComment = mutation({
  args: { id: v.id("blogComments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ message: "Trebuie să fii autentificat", code: "UNAUTHENTICATED" });
    }
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError({ message: "Acces restricționat", code: "FORBIDDEN" });
    }
    await ctx.db.delete(args.id);
  },
});

// ─── REACTIONS ───

export const getReactions = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("blogReactions")
      .withIndex("by_post_emoji", (q) => q.eq("postId", args.postId))
      .collect();
    return REACTION_EMOJIS.map((emoji) => ({
      emoji,
      count: rows.find((row) => row.emoji === emoji)?.count ?? 0,
    }));
  },
});

export const addReaction = mutation({
  args: {
    postId: v.id("blogPosts"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    if (!REACTION_EMOJIS.includes(args.emoji as (typeof REACTION_EMOJIS)[number])) {
      throw new ConvexError({ message: "Reacție invalidă", code: "BAD_REQUEST" });
    }
    const existing = await ctx.db
      .query("blogReactions")
      .withIndex("by_post_emoji", (q) => q.eq("postId", args.postId).eq("emoji", args.emoji))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("blogReactions", { postId: args.postId, emoji: args.emoji, count: 1 });
    }
  },
});
