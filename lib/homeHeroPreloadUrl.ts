import { urlForHeroImage } from "@/lib/sanityImage";

/** First slide URL for HomePageFallback (matches HeroCarousel items order). */
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
      mediaMode?: "images-only" | "video-only" | "video-and-images";
      images?: Array<{ asset?: { _ref?: string }; _ref?: string } | undefined>;
      video?: string | { asset?: { url?: string | null } | null } | null;
      videoPosterImage?: { asset?: { _ref?: string } } | undefined;
    };
    if (s._type !== "heroBlock") continue;

    const prefersVideo =
      s.mediaMode === "video-only" || s.mediaMode === "video-and-images";

    const videoSrc =
      typeof s.video === "string"
        ? s.video.trim()
        : s.video?.asset?.url?.trim() || "";

    if (prefersVideo && videoSrc) {
      const posterSrc = urlForHeroImage(s.videoPosterImage);
      if (posterSrc) return posterSrc;
    }

    if (s.images?.length) {
      const first = s.images[0];
      if (!first) continue;
      const src = urlForHeroImage(first);
      if (src) return src;
    }
  }
  return null;
}
