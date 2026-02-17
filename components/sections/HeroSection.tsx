import { HeroCarousel } from "@/app/components/HeroCarousel";
import { urlFor } from "@/lib/sanityImage";

type HeroBlock = {
  headline?: string;
  subline?: string;
  cta?: { label?: string; href?: string };
  images?: Array<{ asset?: { _ref?: string } }>;
};

export function HeroSection({ block }: { block: HeroBlock }) {
  const headline = block.headline ?? "Alaska's Fresh Catch Awaits — Taste the Adventure";
  const subline = block.subline ?? "Wild-caught  •  Family-run  •  Sustainably sourced";
  const ctaLabel = block.cta?.label ?? "Get Fresh Fish";
  const ctaHref = block.cta?.href ?? "#shop";

  const items: Array<{ src: string; alt: string }> =
    block.images
      ?.map((img) => {
        const u = urlFor(img);
        if (!u) return null;
        return { src: u.url(), alt: headline };
      })
      .filter((x): x is { src: string; alt: string } => Boolean(x)) ?? [];

  const defaultImages = [
    { src: "/1A4A6382.jpeg", alt: "Fresh catch on dock" },
    { src: "/1A4A6336.jpeg", alt: "Fresh catch on dock" },
  ];
  const fallbackItems = items.length > 0 ? items : defaultImages;
  const carouselItems = fallbackItems.length >= 2 ? fallbackItems : [...fallbackItems, ...defaultImages].slice(0, 2);

  return (
    <HeroCarousel
      headline={headline}
      subline={subline}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      items={carouselItems}
    />
  );
}
