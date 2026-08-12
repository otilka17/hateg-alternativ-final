import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const setBorcaneImage = internalMutation({
  args: { name: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("borcaneItems")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    if (item) {
      await ctx.db.patch(item._id, { imageId: args.storageId });
    }
  },
});

export const clearBorcaneImage = internalMutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("borcaneItems")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    if (item?.imageId) {
      await ctx.storage.delete(item.imageId);
      await ctx.db.patch(item._id, { imageId: undefined });
    }
  },
});
