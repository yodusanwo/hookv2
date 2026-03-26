import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "./sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const builder = projectId ? createImageUrlBuilder(client) : null;

export function urlFor(source: { _ref?: string; asset?: { _ref?: string } } | undefined) {
  if (!source || !builder) return null;
  return builder.image(source);
}

type SanityImageSource = { _ref?: string; asset?: { _ref?: string } } | undefined;

/** Full-bleed hero / large backgrounds: cap width (matches HeroCarousel `sizes`), WebP/AVIF via Sanity, moderate quality. */
export function urlForHeroImage(source: SanityImageSource): string | null {
  const b = urlFor(source);
  if (!b) return null;
  return b.width(1600).quality(78).auto("format").url();
}

/** Explore Products category cards (~331px wide @2x). */
export function urlForExploreCategoryImage(source: SanityImageSource): string | null {
  const b = urlFor(source);
  if (!b) return null;
  return b.width(720).quality(80).auto("format").url();
}
