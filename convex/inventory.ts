import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// ─── Queries ───

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inventory").collect();
  },
});

export const getLowStock = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("inventory").collect();
    return all.filter((item) => item.quantity <= item.minThreshold);
  },
});

export const getMovements = query({
  args: { productName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.productName) {
      return await ctx.db
        .query("inventoryMovements")
        .withIndex("by_product", (q) => q.eq("productName", args.productName!))
        .order("desc")
        .take(50);
    }
    return await ctx.db
      .query("inventoryMovements")
      .order("desc")
      .take(100);
  },
});

// ─── Mutations ───

export const addProduct = mutation({
  args: {
    productName: v.string(),
    quantity: v.number(),
    minThreshold: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if product already exists
    const existing = await ctx.db
      .query("inventory")
      .withIndex("by_product", (q) => q.eq("productName", args.productName))
      .first();
    if (existing) {
      throw new ConvexError({
        message: `Produsul "${args.productName}" există deja în stoc.`,
        code: "CONFLICT",
      });
    }

    const id = await ctx.db.insert("inventory", {
      productName: args.productName,
      quantity: args.quantity,
      minThreshold: args.minThreshold,
      unit: args.unit,
    });

    // Record initial entry
    if (args.quantity > 0) {
      await ctx.db.insert("inventoryMovements", {
        productName: args.productName,
        type: "in",
        quantity: args.quantity,
        reason: "Stoc inițial",
        timestamp: new Date().toISOString(),
      });
    }

    return id;
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("inventory"),
    minThreshold: v.optional(v.number()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {};
    if (args.minThreshold !== undefined) updates.minThreshold = args.minThreshold;
    if (args.unit !== undefined) updates.unit = args.unit;
    await ctx.db.patch(args.id, updates);
  },
});

export const removeProduct = mutation({
  args: { id: v.id("inventory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const addStock = mutation({
  args: {
    id: v.id("inventory"),
    quantity: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new ConvexError({ message: "Produsul nu a fost găsit.", code: "NOT_FOUND" });
    }
    const newQty = product.quantity + args.quantity;
    await ctx.db.patch(args.id, { quantity: newQty });

    await ctx.db.insert("inventoryMovements", {
      productName: product.productName,
      type: "in",
      quantity: args.quantity,
      reason: args.reason,
      timestamp: new Date().toISOString(),
    });
  },
});

export const removeStock = mutation({
  args: {
    id: v.id("inventory"),
    quantity: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new ConvexError({ message: "Produsul nu a fost găsit.", code: "NOT_FOUND" });
    }
    const newQty = Math.max(0, product.quantity - args.quantity);
    await ctx.db.patch(args.id, { quantity: newQty });

    await ctx.db.insert("inventoryMovements", {
      productName: product.productName,
      type: "out",
      quantity: args.quantity,
      reason: args.reason,
      timestamp: new Date().toISOString(),
    });
  },
});

// Internal: called by order creation to auto-decrement stock
export const deductOrderItems = internalMutation({
  args: {
    items: v.array(v.object({ name: v.string(), qty: v.number() })),
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const product = await ctx.db
        .query("inventory")
        .withIndex("by_product", (q) => q.eq("productName", item.name))
        .first();
      if (product) {
        const newQty = Math.max(0, product.quantity - item.qty);
        await ctx.db.patch(product._id, { quantity: newQty });
        await ctx.db.insert("inventoryMovements", {
          productName: product.productName,
          type: "out",
          quantity: item.qty,
          reason: `Comandă #${args.orderId.slice(-6).toUpperCase()}`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  },
});
