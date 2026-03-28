/**
 * Shared layout tokens for route-level loading.tsx shells (shop + PDP) so padding and
 * min-height stay aligned with real pages and reduce CLS when skeletons change.
 */
export const ROUTE_MAIN_MIN_HEIGHT_CLASSES =
  "min-h-[calc(100dvh-7rem)] sm:min-h-[calc(100dvh-8rem)] md:min-h-[calc(100dvh-9rem)]";

/** Matches PDP hero top spacing (see app/products/[handle]/page.tsx hero section). */
export const ROUTE_HERO_TOP_PADDING_CLASSES =
  "pt-[140px] pb-10 sm:pt-[170px] md:pt-[230px] md:pb-10";

/** Matches `/shop` main in ShopPageClient — top padding only; main uses pb-0 (not PDP hero pb). */
export const ROUTE_SHOP_MAIN_PADDING_CLASSES =
  "pt-[140px] pb-0 sm:pt-[170px] md:pt-[230px]";

export const ROUTE_LIGHT_BLUE_CSS_VAR = "var(--brand-light-blue-bg)";
