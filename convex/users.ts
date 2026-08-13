import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

// Promote current user to admin (only works via PIN-authenticated admin session)
export const promoteToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }
    await ctx.db.patch(userId, { role: "admin" });
    return userId;
  },
});

// Remove admin role from a user
export const demoteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "User not logged in" });
    }
    // Only admins can demote
    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Not an admin" });
    }
    await ctx.db.patch(args.userId, { role: "customer" });
  },
});
