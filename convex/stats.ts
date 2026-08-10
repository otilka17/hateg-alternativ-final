import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    // Orders stats
    const allOrders = await ctx.db.query("orders").collect();
    const totalOrders = allOrders.length;
    const newOrders = allOrders.filter((o) => o.status === "new").length;
    const inProgressOrders = allOrders.filter((o) => o.status === "in_progress").length;
    const doneOrders = allOrders.filter((o) => o.status === "done").length;
    const totalRevenue = allOrders
      .filter((o) => o.status === "done")
      .reduce((sum, o) => sum + o.totalRon, 0);

    // Orders by last 7 days
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const recentOrders = allOrders.filter((o) => o._creationTime >= sevenDaysAgo);
    const recentRevenue = recentOrders
      .filter((o) => o.status === "done")
      .reduce((sum, o) => sum + o.totalRon, 0);

    // Popular products (from done orders)
    const productCounts: Record<string, number> = {};
    for (const order of allOrders.filter((o) => o.status === "done")) {
      for (const item of order.items) {
        productCounts[item.name] = (productCounts[item.name] ?? 0) + item.qty;
      }
    }
    const popularProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, qty]) => ({ name, qty }));

    // Reviews stats
    const reviews = await ctx.db.query("reviews").collect();
    const totalReviews = reviews.length;
    const approvedReviews = reviews.filter((r) => r.approved).length;
    const pendingReviews = reviews.filter((r) => !r.approved).length;
    const avgStars = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length) * 10) / 10
      : 0;

    // Newsletter
    const newsletter = await ctx.db.query("newsletter").collect();
    const totalSubscribers = newsletter.length;

    // Users
    const users = await ctx.db.query("users").collect();
    const totalUsers = users.length;

    // Daily orders (last 7 days)
    const dailyOrders: { day: string; count: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      const dayOrders = allOrders.filter(
        (o) => o._creationTime >= dayStart && o._creationTime < dayEnd
      );
      const date = new Date(dayStart);
      dailyOrders.push({
        day: `${date.getDate()}/${date.getMonth() + 1}`,
        count: dayOrders.length,
        revenue: dayOrders
          .filter((o) => o.status === "done")
          .reduce((sum, o) => sum + o.totalRon, 0),
      });
    }

    return {
      totalOrders,
      newOrders,
      inProgressOrders,
      doneOrders,
      totalRevenue,
      recentOrders: recentOrders.length,
      recentRevenue,
      popularProducts,
      totalReviews,
      approvedReviews,
      pendingReviews,
      avgStars,
      totalSubscribers,
      totalUsers,
      dailyOrders,
    };
  },
});
