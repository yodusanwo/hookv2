import { HeroCarousel } from "@/app/components/HeroCarousel";
import { PromoBanner } from "../PromoBanner";
import { PLACEHOLDER_HERO_CAROUSEL_ITEMS } from "@/lib/homeHeroPreloadUrl";
import { urlForHeroImage } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type HeroBlock = {
  variant?: "default" | "story";
  headline?: string;
  subline?: string;
  cta?: { label?: string; href?: string };
  mediaMode?: "images-only" | "video-only" | "video-and-images";
  images?: Array<{ asset?: { _ref?: string } }>;
  video?: string | null;
  videoPosterImage?: { asset?: { _ref?: string } };
};

type HeroMediaItem =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; alt: string; poster?: string };

function normalizeHeadline(raw: string | undefined): { line1: string; line2: string } {
  const fallback = { line1: "From Alaska's Waters to Your Table", line2: "" };
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  // Only apply two-line split for known Alaska patterns with "—" or newlines
  if (!trimmed.includes("Alaska")) {
    return { line1: trimmed, line2: "" };
  }
  const normalized = trimmed
    .replace(/\s*\n\s*—\s*\n\s*/g, " — ")
    .replace(/—\s+/, "— ");
  const parts = normalized.split(/\s+—\s+/);
  if (parts.length >= 2) {
    return { line1: `${parts[0]?.trim() ?? ""}\u00A0—`, line2: parts.slice(1).join(" ").trim() };
  }
  const byNewline = normalized.split("\n").map((s) => s.trim()).filter(Boolean);
  if (byNewline.length >= 2) {
    return { line1: byNewline[0]!, line2: byNewline.slice(1).join(" ") };
  }
  return { line1: trimmed, line2: "" };
}

export function HeroSection({ block, promoBanner, promoBannerUrl }: { block: HeroBlock; promoBanner?: string | null; promoBannerUrl?: string | null }) {
  const variant = block.variant === "story" ? "story" : "default";
  const headline = normalizeHeadline(block.headline);
  const subline = block.subline ?? (variant === "story" ? "Tradition  •  Quality  •  Respect for the ocean" : "Wild-caught  •  Family-run  •  Sustainably sourced");
  const showCta = variant !== "story";
  const ctaLabel = showCta
    ? (block.cta?.label?.trim() || "Get Fresh Fish")
    : undefined;
  const ctaHref = showCta
    ? (block.cta?.href?.trim() ? safeHref(block.cta.href!.trim()) : "#shop")
    : undefined;

  const imageItems: HeroMediaItem[] =
    block.images
      ?.map((img) => {
        const src = urlForHeroImage(img);
        if (!src) return null;
        return { type: "image", src, alt: `${headline.line1} ${headline.line2}` };
      })
      .filter((x): x is HeroMediaItem => Boolean(x)) ?? [];

  const videoSrc = block.video?.trim() || "";
  const videoPoster = urlForHeroImage(block.videoPosterImage);
  const videoItem: HeroMediaItem[] = videoSrc
    ? [
        {
          type: "video",
          src: videoSrc,
          alt: `${headline.line1} ${headline.line2}`,
          ...(videoPoster ? { poster: videoPoster } : {}),
        },
      ]
    : [];

  const carouselItems: HeroMediaItem[] =
    block.mediaMode === "video-only"
      ? (videoItem.length ? videoItem : imageItems)
      : block.mediaMode === "video-and-images"
        ? [...videoItem, ...imageItems]
        : imageItems;

  const fallbackItems: HeroMediaItem[] = PLACEHOLDER_HERO_CAROUSEL_ITEMS.map((item) => ({
    type: "image",
    src: item.src,
    alt: item.alt,
  }));

  return (
    <>
      <HeroCarousel
        variant={variant}
        headlineLine1={headline.line1}
        headlineLine2={headline.line2}
        subline={subline}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        items={carouselItems.length > 0 ? carouselItems : fallbackItems}
      />
      {promoBanner && <PromoBanner text={promoBanner} href={promoBannerUrl} />}
    </>
  );
}
