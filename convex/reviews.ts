import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Public: list approved reviews (for homepage)
export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .order("desc")
      .take(20);
  },
});

// Admin: list all reviews
export const listAll = query({
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
    return await ctx.db.query("reviews").order("desc").collect();
  },
});

// Public: submit a review (anyone can submit, admin approves)
export const submit = mutation({
  args: {
    name: v.string(),
    location: v.optional(v.string()),
    stars: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.stars < 1 || args.stars > 5) {
      throw new ConvexError({ message: "Număr de stele invalid", code: "BAD_REQUEST" });
    }
    if (args.text.trim().length < 10) {
      throw new ConvexError({ message: "Recenzia trebuie să aibă cel puțin 10 caractere", code: "BAD_REQUEST" });
    }
    await ctx.db.insert("reviews", {
      name: args.name.trim(),
      location: args.location?.trim() || undefined,
      stars: Math.round(args.stars),
      text: args.text.trim(),
      approved: false,
    });
  },
});

// Admin: approve a review
export const approve = mutation({
  args: { id: v.id("reviews") },
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

// Admin: delete a review
export const remove = mutation({
  args: { id: v.id("reviews") },
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
