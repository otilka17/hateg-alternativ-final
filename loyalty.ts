import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel.d.ts";
import type { MutationCtx } from "./_generated/server.d.ts";

// ─── CONFIG ───

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("loyaltyConfig").collect();
    return configs[0] ?? null;
  },
});

export const upsertConfig = mutation({
  args: {
    stampsRequired: v.number(),
    rewardTitle: v.string(),
    rewardDescription: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("loyaltyConfig").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("loyaltyConfig", args);
  },
});

// ─── CUSTOMER QUERIES ───

export const getMyCard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;

    const card = await ctx.db
      .query("loyaltyCards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const config = await ctx.db.query("loyaltyConfig").first();

    return {
      card: card ?? { currentStamps: 0, totalStampsEarned: 0, totalRewardsRedeemed: 0 },
      config: config ?? null,
    };
  },
});

export const getMyStamps = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];

    const stamps = await ctx.db
      .query("loyaltyStamps")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort newest first
    stamps.sort((a, b) => b.awardedAt.localeCompare(a.awardedAt));
    return stamps.slice(0, 20);
  },
});

export const getMyRewards = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];

    const rewards = await ctx.db
      .query("loyaltyRewards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Sort newest first
    rewards.sort((a, b) => (b._creationTime - a._creationTime));
    return rewards;
  },
});

export const redeemReward = mutation({
  args: { rewardId: v.id("loyaltyRewards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ message: "Trebuie să fii autentificat.", code: "UNAUTHENTICATED" });
    }

    const reward = await ctx.db.get(args.rewardId);
    if (!reward) {
      throw new ConvexError({ message: "Recompensa nu a fost găsită.", code: "NOT_FOUND" });
    }
    if (reward.status === "redeemed") {
      throw new ConvexError({ message: "Recompensa a fost deja folosită.", code: "BAD_REQUEST" });
    }

    await ctx.db.patch(args.rewardId, {
      status: "redeemed",
      redeemedAt: new Date().toISOString(),
    });
  },
});

// ─── STAMP AWARD (called when order is marked as done) ───

async function awardStampToUser(
  ctx: MutationCtx,
  userId: Id<"users">,
  orderId: Id<"orders">
) {
  // Check if stamp already awarded for this order
  const existing = await ctx.db
    .query("loyaltyStamps")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .first();
  if (existing) return; // Already awarded

  // Get or create loyalty card
  let card = await ctx.db
    .query("loyaltyCards")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (!card) {
    const cardId = await ctx.db.insert("loyaltyCards", {
      userId,
      currentStamps: 0,
      totalStampsEarned: 0,
      totalRewardsRedeemed: 0,
    });
    card = await ctx.db.get(cardId);
    if (!card) return;
  }

  // Award stamp
  await ctx.db.insert("loyaltyStamps", {
    userId,
    orderId,
    awardedAt: new Date().toISOString(),
  });

  const newStamps = card.currentStamps + 1;
  const newTotal = card.totalStampsEarned + 1;

  // Check if user earned a reward
  const config = await ctx.db.query("loyaltyConfig").first();
  if (config && config.active && newStamps >= config.stampsRequired) {
    // Award reward, reset stamps
    await ctx.db.insert("loyaltyRewards", {
      userId,
      title: config.rewardTitle,
      status: "available",
    });
    await ctx.db.patch(card._id, {
      currentStamps: newStamps - config.stampsRequired,
      totalStampsEarned: newTotal,
      totalRewardsRedeemed: card.totalRewardsRedeemed + 1,
    });
  } else {
    await ctx.db.patch(card._id, {
      currentStamps: newStamps,
      totalStampsEarned: newTotal,
    });
  }
}

// Internal mutation for awarding stamps (called from orders.updateStatus)
export const awardStamp = internalMutation({
  args: { userId: v.id("users"), orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await awardStampToUser(ctx, args.userId, args.orderId);
  },
});

// ─── ADMIN QUERIES ───

export const listAllCards = query({
  args: {},
  handler: async (ctx) => {
    const cards = await ctx.db.query("loyaltyCards").collect();
    return Promise.all(
      cards.map(async (card) => {
        const user = await ctx.db.get(card.userId);
        return {
          ...card,
          userName: user?.name ?? user?.email ?? "Anonim",
          userEmail: user?.email ?? "",
        };
      })
    );
  },
});

export const listAllRewards = query({
  args: {},
  handler: async (ctx) => {
    const rewards = await ctx.db.query("loyaltyRewards").collect();
    return Promise.all(
      rewards.map(async (reward) => {
        const user = await ctx.db.get(reward.userId);
        return {
          ...reward,
          userName: user?.name ?? user?.email ?? "Anonim",
        };
      })
    );
  },
});
