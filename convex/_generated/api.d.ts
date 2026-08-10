/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as blog from "../blog.js";
import type * as cms from "../cms.js";
import type * as dailySpecial from "../dailySpecial.js";
import type * as gallery from "../gallery.js";
import type * as inventory from "../inventory.js";
import type * as loyalty from "../loyalty.js";
import type * as newsletter from "../newsletter.js";
import type * as orders from "../orders.js";
import type * as partners from "../partners.js";
import type * as promoBanner from "../promoBanner.js";
import type * as pushIdentities from "../pushIdentities.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as schedule from "../schedule.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  blog: typeof blog;
  cms: typeof cms;
  dailySpecial: typeof dailySpecial;
  gallery: typeof gallery;
  inventory: typeof inventory;
  loyalty: typeof loyalty;
  newsletter: typeof newsletter;
  orders: typeof orders;
  partners: typeof partners;
  promoBanner: typeof promoBanner;
  pushIdentities: typeof pushIdentities;
  pushNotifications: typeof pushNotifications;
  schedule: typeof schedule;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
