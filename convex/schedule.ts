import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Default schedule used when no entries exist in the database
const DEFAULT_SCHEDULE = [
  { dayOfWeek: 0, openTime: "08:00", closeTime: "18:00", isClosed: false }, // Sunday
  { dayOfWeek: 1, openTime: "07:00", closeTime: "20:00", isClosed: false }, // Monday
  { dayOfWeek: 2, openTime: "07:00", closeTime: "20:00", isClosed: false }, // Tuesday
  { dayOfWeek: 3, openTime: "07:00", closeTime: "20:00", isClosed: false }, // Wednesday
  { dayOfWeek: 4, openTime: "07:00", closeTime: "20:00", isClosed: false }, // Thursday
  { dayOfWeek: 5, openTime: "07:00", closeTime: "20:00", isClosed: false }, // Friday
  { dayOfWeek: 6, openTime: "07:00", closeTime: "20:00", isClosed: false }, // Saturday
];

export const get = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("schedule").collect();
    if (entries.length === 0) {
      return DEFAULT_SCHEDULE;
    }
    // Sort by dayOfWeek
    return entries
      .map((e) => ({
        dayOfWeek: e.dayOfWeek,
        openTime: e.openTime,
        closeTime: e.closeTime,
        isClosed: e.isClosed,
      }))
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  },
});

export const update = mutation({
  args: {
    schedule: v.array(
      v.object({
        dayOfWeek: v.number(),
        openTime: v.string(),
        closeTime: v.string(),
        isClosed: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete all existing entries
    const existing = await ctx.db.query("schedule").collect();
    for (const entry of existing) {
      await ctx.db.delete(entry._id);
    }
    // Insert new schedule
    for (const day of args.schedule) {
      await ctx.db.insert("schedule", day);
    }
  },
});
