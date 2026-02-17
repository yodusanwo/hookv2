import { HeroCarousel } from "@/app/components/HeroCarousel";
import { PromoBanner } from "../PromoBanner";
import { urlFor } from "@/lib/sanityImage";

type HeroBlock = {
  headline?: string;
  subline?: string;
  cta?: { label?: string; href?: string };
  images?: Array<{ asset?: { _ref?: string } }>;
};

function normalizeHeadline(raw: string | undefined): { line1: string; line2: string } {
  const fallback = { line1: "Alaska's Fresh Catch Awaits —", line2: "Taste the Adventure" };
  if (!raw || !raw.includes("Alaska")) return fallback;
  const normalized = raw
    .replace(/\s*\n\s*—\s*\n\s*/g, " — ")
    .replace(/—\s+/, "— ")
    .trim();
  const parts = normalized.split(/\s+—\s+/);
  if (parts.length >= 2) {
    return { line1: `${parts[0]?.trim() ?? ""} —`, line2: parts.slice(1).join(" ").trim() };
  }
  const byNewline = normalized.split("\n").map((s) => s.trim()).filter(Boolean);
  if (byNewline.length >= 2) {
    return { line1: byNewline[0]!, line2: byNewline.slice(1).join(" ") };
  }
  return fallback;
}

export function HeroSection({ block, promoBanner }: { block: HeroBlock; promoBanner?: string | null }) {
  const headline = normalizeHeadline(block.headline);
  const subline = block.subline ?? "Wild-caught  •  Family-run  •  Sustainably sourced";
  const ctaLabel = block.cta?.label ?? "Get Fresh Fish";
  const ctaHref = block.cta?.href ?? "#shop";

  const items: Array<{ src: string; alt: string }> =
    block.images
      ?.map((img) => {
        const u = urlFor(img);
        if (!u) return null;
        return { src: u.url(), alt: `${headline.line1} ${headline.line2}` };
      })
      .filter((x): x is { src: string; alt: string } => Boolean(x)) ?? [];

  const defaultImages = [
    { src: "/1A4A6382.jpeg", alt: "Fresh catch on dock" },
    { src: "/1A4A6336.jpeg", alt: "Fresh catch on dock" },
  ];
  const fallbackItems = items.length > 0 ? items : defaultImages;
  const carouselItems = fallbackItems.length >= 2 ? fallbackItems : [...fallbackItems, ...defaultImages].slice(0, 2);

  return (
    <>
      <HeroCarousel
        headlineLine1={headline.line1}
        headlineLine2={headline.line2}
        subline={subline}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        items={carouselItems}
      />
      {promoBanner && <PromoBanner text={promoBanner} />}
    </>
  );
}
