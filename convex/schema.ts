import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()), // "admin" | "customer" (default: customer)
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  orders: defineTable({
    // Customer info
    fname: v.string(),
    lname: v.string(),
    phone: v.string(),
    email: v.string(),
    // Delivery info
    mode: v.union(v.literal("pickup"), v.literal("delivery")),
    pickupDate: v.optional(v.string()),
    pickupTime: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    county: v.optional(v.string()),
    delDate: v.optional(v.string()),
    delTime: v.optional(v.string()),
    obs: v.optional(v.string()),
    // Products
    items: v.array(v.object({
      name: v.string(),
      price: v.number(),
      qty: v.number(),
    })),
    totalRon: v.number(),
    // Status
    status: v.union(
      v.literal("new"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("cancelled"),
    ),
  }).index("by_status", ["status"]).index("by_phone", ["phone"]),

  promoBanner: defineTable({
    text: v.string(),
    active: v.boolean(),
    emoji: v.optional(v.string()),
  }),

  newsletter: defineTable({
    email: v.string(),
  }).index("by_email", ["email"]),

  schedule: defineTable({
    // Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday
    dayOfWeek: v.number(),
    openTime: v.string(), // "HH:mm" format, e.g. "07:00"
    closeTime: v.string(), // "HH:mm" format, e.g. "20:00"
    isClosed: v.boolean(), // If true, the business is closed this day
  }).index("by_day", ["dayOfWeek"]),

  // CMS: Menu products
  menuItems: defineTable({
    category: v.string(), // "cafea", "specialitati", "limonada", "sanatate", "sandwich", "dulce"
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_category", ["category"]),

  // CMS: Borcane products
  borcaneItems: defineTable({
    name: v.string(),
    description: v.string(),
    info: v.string(), // e.g. "300g · vegetal · fără conservanți"
    price: v.number(),
    emoji: v.string(),
    tag: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
    active: v.boolean(),
  }),

  // CMS: Pachete products
  pacheteItems: defineTable({
    name: v.string(),
    description: v.string(),
    includes: v.array(v.string()),
    price: v.number(),
    emoji: v.string(),
    tag: v.optional(v.string()),
    saves: v.optional(v.number()),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.number(),
    active: v.boolean(),
  }),

  // CMS: Gallery images
  galleryImages: defineTable({
    alt: v.string(),
    category: v.string(),
    imageId: v.id("_storage"),
    span: v.optional(v.union(v.literal("tall"), v.literal("wide"))),
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_category", ["category"]),

  // CMS: Daily special / offer
  dailySpecial: defineTable({
    title: v.string(),
    description: v.string(),
    originalPrice: v.optional(v.number()),
    discountPrice: v.optional(v.number()),
    badge: v.optional(v.string()), // e.g. "-20%", "NOU", "LIMITAT"
    imageId: v.optional(v.id("_storage")),
    active: v.boolean(),
  }),

  // CMS: Site content (hero texts, images, etc.)
  siteContent: defineTable({
    key: v.string(), // unique key like "hero_title", "hero_subtitle"
    value: v.string(),
    imageId: v.optional(v.id("_storage")),
  }).index("by_key", ["key"]),

  // Loyalty program
  loyaltyConfig: defineTable({
    stampsRequired: v.number(), // stamps needed to earn a reward
    rewardTitle: v.string(), // e.g. "Cafea gratuită"
    rewardDescription: v.string(), // e.g. "O cafea la alegere, pe noi!"
    active: v.boolean(),
  }),

  loyaltyCards: defineTable({
    userId: v.id("users"),
    currentStamps: v.number(),
    totalStampsEarned: v.number(),
    totalRewardsRedeemed: v.number(),
  }).index("by_user", ["userId"]),

  loyaltyStamps: defineTable({
    userId: v.id("users"),
    orderId: v.id("orders"),
    awardedAt: v.string(), // ISO 8601 UTC
  }).index("by_user", ["userId"]).index("by_order", ["orderId"]),

  loyaltyRewards: defineTable({
    userId: v.id("users"),
    title: v.string(),
    redeemedAt: v.optional(v.string()), // ISO 8601 UTC, null if not yet redeemed
    status: v.union(v.literal("available"), v.literal("redeemed")),
  }).index("by_user", ["userId"]),

  // Push notification identity mapping
  pushIdentities: defineTable({
    secret: v.string(),
    visitorId: v.string(),
  })
    .index("by_secret", ["secret"])
    .index("by_visitorId", ["visitorId"]),

  // CMS: Blog posts
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(), // rich text / HTML content
    category: v.string(), // "retete", "noutati", "sezon", "povesti"
    coverImageId: v.optional(v.id("_storage")),
    published: v.boolean(),
    publishedAt: v.optional(v.string()), // ISO 8601 UTC
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]).index("by_category", ["category"]).index("by_published", ["published"]),

  // Inventory / Stock management (mini ERP)
  inventory: defineTable({
    productName: v.string(), // unique product name
    quantity: v.number(), // current stock
    minThreshold: v.number(), // alert when qty <= this
    unit: v.string(), // "buc", "kg", "l", "porții"
  }).index("by_product", ["productName"]),

  inventoryMovements: defineTable({
    productName: v.string(),
    type: v.union(v.literal("in"), v.literal("out")),
    quantity: v.number(), // always positive
    reason: v.string(), // "Aprovizionare", "Comandă #ABC", "Ajustare", "Pierdere"
    timestamp: v.string(), // ISO 8601 UTC
  }).index("by_product", ["productName"]).index("by_timestamp", ["timestamp"]),

  // CMS: Homepage carousel slides
  slides: defineTable({
    title: v.string(),
    subtitle: v.string(),
    description: v.string(),
    link: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()), // CDN URL for pre-existing images
    sortOrder: v.number(),
    active: v.boolean(),
  }),

  // Partners
  partners: defineTable({
    name: v.string(),
    description: v.string(),
    website: v.optional(v.string()),
    logoImageId: v.optional(v.id("_storage")),
    coverImageId: v.optional(v.id("_storage")), // featured product/cover image
    featured: v.boolean(), // show on homepage
    sortOrder: v.number(),
    active: v.boolean(),
  }),

  // Site info (address, phone, email, social links, company details)
  siteInfo: defineTable({
    key: v.string(), // "address", "phone", "email", "whatsapp", "instagram", "facebook", "companyName", "cui", "regCom", "mapUrl"
    value: v.string(),
  }).index("by_key", ["key"]),

  // Customer reviews
  reviews: defineTable({
    name: v.string(),
    location: v.optional(v.string()),
    stars: v.number(), // 1-5
    text: v.string(),
    approved: v.boolean(), // admin must approve before showing
  }).index("by_approved", ["approved"]),

  // Sandwich builder ingredients
  sandwichIngredients: defineTable({
    category: v.string(), // "paine", "proteina", "legume", "sos", "extra"
    name: v.string(),
    price: v.number(),
    emoji: v.string(),
    sortOrder: v.number(),
    active: v.boolean(),
  }).index("by_category", ["category"]),

  // Cutia Metanoia - Subscription box
  boxSubscriptions: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    tier: v.string(), // "gurmand" | "colecționar"
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("cancelled")),
    subscribedAt: v.string(), // ISO 8601 UTC
  }).index("by_email", ["email"]).index("by_status", ["status"]),

  boxConfig: defineTable({
    month: v.string(), // "2026-07", "2026-08" etc.
    totalSlots: v.number(), // max available (e.g. 50)
    closesAt: v.string(), // ISO 8601 UTC - when registration closes
    revealItems: v.array(v.object({
      label: v.string(),
      revealedAt: v.optional(v.string()), // ISO 8601 UTC, null if not revealed yet
      imageId: v.optional(v.id("_storage")),
    })),
    active: v.boolean(),
  }).index("by_month", ["month"]),
});
