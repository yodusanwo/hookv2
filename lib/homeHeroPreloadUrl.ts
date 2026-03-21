import { urlForHeroImage } from "@/lib/sanityImage";

/** First slide URL for HomePageFallback (matches HeroCarousel items order). */
export const FALLBACK_HOME_HERO_PRELOAD_URL =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";

/**
 * LCP hero image URL for `<link rel="preload">` — first image of the first `heroBlock` in Sanity sections.
 */
export function getFirstHeroImagePreloadUrlFromSections(
  sections: unknown[] | null | undefined,
): string | null {
  if (!Array.isArray(sections) || sections.length === 0) return null;
  for (const section of sections) {
    const s = section as {
      _type?: string;
      images?: Array<{ asset?: { _ref?: string }; _ref?: string } | undefined>;
    };
    if (s._type !== "heroBlock" || !s.images?.length) continue;
    const first = s.images[0];
    if (!first) continue;
    const src = urlForHeroImage(first);
    if (src) return src;
  }
  return null;
}
