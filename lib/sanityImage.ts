import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "./sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const builder = projectId ? createImageUrlBuilder(client) : null;

export function urlFor(source: { _ref?: string; asset?: { _ref?: string } } | undefined) {
  if (!source || !builder) return null;
  return builder.image(source);
}

export type SanityImageSource = { _ref?: string; asset?: { _ref?: string } } | undefined;

/**
 * Sanity CDN URL with max width, quality, and auto WebP/AVIF.
 * Prefer this over raw `urlFor(x).url()` so uploads are not served at full resolution.
 */
export function urlForSizedImage(
  source: SanityImageSource,
  width: number,
  quality = 80,
): string | null {
  const b = urlFor(source);
  if (!b) return null;
  return b.width(width).quality(quality).auto("format").url();
}

/** Full-bleed hero / large backgrounds: cap width (matches HeroCarousel `sizes`), WebP/AVIF via Sanity, moderate quality. */
export function urlForHeroImage(source: SanityImageSource): string | null {
  return urlForSizedImage(source, 1600, 78);
}

/** Explore Products category cards (~331px wide @2x). */
export function urlForExploreCategoryImage(source: SanityImageSource): string | null {
  return urlForSizedImage(source, 720, 80);
}
