/** First slide URL for placeholder hero carousels (HomePageFallback, Story fallback). */
export const FALLBACK_HOME_HERO_PRELOAD_URL =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

/** CDN slides when Sanity (or Story fallback) has no hero images. */
export const PLACEHOLDER_HERO_CAROUSEL_ITEMS: Array<{ src: string; alt: string }> = [
  { src: FALLBACK_HOME_HERO_PRELOAD_URL, alt: "Coastal Alaska landscape" },
  {
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80",
    alt: "Open ocean",
  },
];
