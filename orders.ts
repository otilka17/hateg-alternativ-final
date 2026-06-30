import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api.js";
import type { Id } from "./_generated/dataModel.d.ts";

export const create = mutation({
  args: {
    fname: v.string(),
    lname: v.string(),
    phone: v.string(),
    email: v.string(),
    mode: v.union(v.literal("pickup"), v.literal("delivery")),
    pickupDate: v.optional(v.string()),
    pickupTime: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    county: v.optional(v.string()),
    delDate: v.optional(v.string()),
    delTime: v.optional(v.string()),
    obs: v.optional(v.string()),
    items: v.array(v.object({
      name: v.string(),
      price: v.number(),
      qty: v.number(),
    })),
    totalRon: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"orders">> => {
    const orderId = await ctx.db.insert("orders", { ...args, status: "new" });

    // Send push notification to all subscribed admins (broadcast)
    await ctx.scheduler.runAfter(0, internal.pushNotifications.sendNotification, {
      title: "Comandă nouă!",
      body: `${args.fname} ${args.lname} — ${args.totalRon} lei (${args.items.length} produse)`,
    });

    // Auto-deduct inventory stock
    await ctx.scheduler.runAfter(0, internal.inventory.deductOrderItems, {
      items: args.items.map((i) => ({ name: i.name, qty: i.qty })),
      orderId,
    });

    return orderId;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("new"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const order = await ctx.db.get(args.id);
    const previousStatus = order?.status;

    await ctx.db.patch(args.id, { status: args.status });

    // Award loyalty stamp when order is completed
    if (args.status === "done" && previousStatus !== "done" && order) {
      // Find user by email to award stamp
      const users = await ctx.db.query("users").collect();
      const matchedUser = users.find(
        (u) => u.email && u.email.toLowerCase() === order.email.toLowerCase()
      );
      if (matchedUser) {
        await ctx.scheduler.runAfter(0, internal.loyalty.awardStamp, {
          userId: matchedUser._id,
          orderId: args.id,
        });
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const removeAll = mutation({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
  },
});
