import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      throw new ConvexError({
        message: "Acest email este deja abonat la newsletter.",
        code: "CONFLICT",
      });
    }

    await ctx.db.insert("newsletter", { email });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("newsletter").order("desc").collect();
  },
});

export const remove = mutation({
  args: { id: v.id("newsletter") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
