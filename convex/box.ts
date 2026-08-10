import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

// Get the current active box config
export const getActiveBox = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("boxConfig")
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!config) return null;

    // Count active subscriptions for this month
    const subscriptions = await ctx.db
      .query("boxSubscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const takenSlots = subscriptions.length;

    // Resolve reveal item images
    const revealItems = await Promise.all(
      config.revealItems.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
    );

    return {
      ...config,
      revealItems,
      takenSlots,
      remainingSlots: config.totalSlots - takenSlots,
    };
  },
});

// Subscribe to the box
export const subscribe = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if box is active
    const config = await ctx.db
      .query("boxConfig")
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!config) {
      throw new ConvexError({
        message: "Nu mai sunt abonamente disponibile momentan.",
        code: "BAD_REQUEST",
      });
    }

    // Check if registration is still open
    const now = new Date().toISOString();
    if (now > config.closesAt) {
      throw new ConvexError({
        message: "Înscrierile s-au închis pentru luna aceasta.",
        code: "BAD_REQUEST",
      });
    }

    // Check remaining slots
    const subscriptions = await ctx.db
      .query("boxSubscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    if (subscriptions.length >= config.totalSlots) {
      throw new ConvexError({
        message: "Toate locurile s-au ocupat! Revino luna viitoare.",
        code: "BAD_REQUEST",
      });
    }

    // Check if already subscribed
    const existing = await ctx.db
      .query("boxSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing && existing.status === "active") {
      throw new ConvexError({
        message: "Ești deja abonat! Verifică email-ul pentru detalii.",
        code: "CONFLICT",
      });
    }

    // Create subscription
    await ctx.db.insert("boxSubscriptions", {
      email: args.email,
      name: args.name,
      phone: args.phone,
      tier: args.tier,
      status: "active",
      subscribedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Admin: Create/update box config
export const upsertBoxConfig = mutation({
  args: {
    month: v.string(),
    totalSlots: v.number(),
    closesAt: v.string(),
    revealItems: v.array(v.object({
      label: v.string(),
      revealedAt: v.optional(v.string()),
      imageId: v.optional(v.id("_storage")),
    })),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Deactivate all existing if activating a new one
    if (args.active) {
      const existing = await ctx.db
        .query("boxConfig")
        .filter((q) => q.eq(q.field("active"), true))
        .collect();
      for (const box of existing) {
        await ctx.db.patch(box._id, { active: false });
      }
    }

    // Check if month already exists
    const existingMonth = await ctx.db
      .query("boxConfig")
      .withIndex("by_month", (q) => q.eq("month", args.month))
      .first();

    if (existingMonth) {
      await ctx.db.patch(existingMonth._id, args);
      return existingMonth._id;
    }

    return await ctx.db.insert("boxConfig", args);
  },
});

// Admin: List all subscriptions
export const listSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("boxSubscriptions").collect();
  },
});
