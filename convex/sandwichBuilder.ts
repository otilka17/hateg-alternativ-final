import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api.js";

// List all active ingredients grouped by category
export const listIngredients = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("sandwichIngredients").collect();
    const active = all.filter((i) => i.active);
    active.sort((a, b) => a.sortOrder - b.sortOrder);

    const categories = ["paine", "proteina", "legume", "sos", "extra"] as const;
    const grouped: Record<string, typeof active> = {};
    for (const cat of categories) {
      grouped[cat] = active.filter((i) => i.category === cat);
    }
    return grouped;
  },
});

// Admin: list all ingredients
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("sandwichIngredients").collect();
    all.sort((a, b) => {
      const catOrder = ["paine", "proteina", "legume", "sos", "extra"];
      const catDiff = catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
      if (catDiff !== 0) return catDiff;
      return a.sortOrder - b.sortOrder;
    });
    return all;
  },
});

// Admin: add ingredient
export const addIngredient = mutation({
  args: {
    category: v.string(),
    name: v.string(),
    price: v.number(),
    emoji: v.string(),
    sortOrder: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sandwichIngredients", args);
  },
});

// Admin: update ingredient
export const updateIngredient = mutation({
  args: {
    id: v.id("sandwichIngredients"),
    category: v.optional(v.string()),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    emoji: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Admin: delete ingredient
export const deleteIngredient = mutation({
  args: { id: v.id("sandwichIngredients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Seed default ingredients
export const seed = internalMutation({
  args: {},
  handler: async (ctx): Promise<void> => {
    // Check if already seeded
    const existing = await ctx.db.query("sandwichIngredients").first();
    if (existing) return;

    const ingredients = [
      // Paine
      { category: "paine", name: "Ciabatta clasică", price: 5, emoji: "🍞", sortOrder: 1, active: true },
      { category: "paine", name: "Ciabatta integrală", price: 6, emoji: "🌾", sortOrder: 2, active: true },
      { category: "paine", name: "Focaccia", price: 7, emoji: "🫓", sortOrder: 3, active: true },
      // Proteina
      { category: "proteina", name: "Pui la grill", price: 10, emoji: "🍗", sortOrder: 1, active: true },
      { category: "proteina", name: "Somon afumat", price: 14, emoji: "🐟", sortOrder: 2, active: true },
      { category: "proteina", name: "Ton", price: 12, emoji: "🐠", sortOrder: 3, active: true },
      { category: "proteina", name: "Chiftea de casă", price: 9, emoji: "🥩", sortOrder: 4, active: true },
      { category: "proteina", name: "Prosciutto", price: 13, emoji: "🥓", sortOrder: 5, active: true },
      { category: "proteina", name: "Omletă", price: 6, emoji: "🥚", sortOrder: 6, active: true },
      // Legume
      { category: "legume", name: "Salată verde", price: 2, emoji: "🥬", sortOrder: 1, active: true },
      { category: "legume", name: "Roșii", price: 2, emoji: "🍅", sortOrder: 2, active: true },
      { category: "legume", name: "Castraveți", price: 2, emoji: "🥒", sortOrder: 3, active: true },
      { category: "legume", name: "Ceapă roșie", price: 1, emoji: "🧅", sortOrder: 4, active: true },
      { category: "legume", name: "Ardei gras", price: 2, emoji: "🫑", sortOrder: 5, active: true },
      { category: "legume", name: "Avocado", price: 6, emoji: "🥑", sortOrder: 6, active: true },
      { category: "legume", name: "Măsline", price: 3, emoji: "🫒", sortOrder: 7, active: true },
      // Sosuri
      { category: "sos", name: "Mustar de casă", price: 2, emoji: "🟡", sortOrder: 1, active: true },
      { category: "sos", name: "Pesto verde", price: 3, emoji: "🟢", sortOrder: 2, active: true },
      { category: "sos", name: "Ketchup artizanal", price: 2, emoji: "🔴", sortOrder: 3, active: true },
      { category: "sos", name: "Maioneza de casă", price: 2, emoji: "⚪", sortOrder: 4, active: true },
      { category: "sos", name: "Sos de usturoi", price: 2, emoji: "🧄", sortOrder: 5, active: true },
      { category: "sos", name: "Sos picant", price: 2, emoji: "🌶️", sortOrder: 6, active: true },
      // Extra
      { category: "extra", name: "Mozzarella", price: 5, emoji: "🧀", sortOrder: 1, active: true },
      { category: "extra", name: "Cheddar", price: 5, emoji: "🧀", sortOrder: 2, active: true },
      { category: "extra", name: "Parmezan", price: 6, emoji: "🧀", sortOrder: 3, active: true },
      { category: "extra", name: "Bacon crocant", price: 5, emoji: "🥓", sortOrder: 4, active: true },
      { category: "extra", name: "Jalapeños", price: 3, emoji: "🌶️", sortOrder: 5, active: true },
      { category: "extra", name: "Semințe", price: 2, emoji: "🌻", sortOrder: 6, active: true },
    ];

    for (const ing of ingredients) {
      await ctx.db.insert("sandwichIngredients", ing);
    }
  },
});
