import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { urlForSizedImage } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

const RECIPES_TOP_PADDING_PX = 56;
const RECIPES_BG = "#D4F2FF";
const SHOW_MORE_LINK_STYLE = {
  color: "#498CCB",
  fontFamily: "Inter, var(--font-inter), sans-serif",
  fontSize: "1rem",
  fontStyle: "normal" as const,
  fontWeight: 500,
  lineHeight: "normal",
};

type Recipe = {
  title?: string;
  image?: { asset?: { _ref?: string } };
  url?: string;
};

type RecipesBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  recipes?: Recipe[];
  showMoreUrl?: string;
};

export function RecipesSection({ block }: { block: RecipesBlock }) {
  const title = block.title ?? "Recipes";
  const description = block.description ?? "";
  const recipes = block.recipes ?? [];
  const showMoreUrl = block.showMoreUrl;

  if (recipes.length === 0) return null;

  const bgColor = block.backgroundColor ?? RECIPES_BG;
  return (
    <section
      id="recipes"
      className="relative z-10 mx-auto flex min-w-0 flex-col justify-start pb-12 md:pb-0"
      style={{ backgroundColor: bgColor, width: "100%", minHeight: 433 }}
    >
      <div
        className="mx-auto w-full max-w-6xl px-6 md:px-4 pt-12 md:pt-[56px]"
      >
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />
        <div
          className="mt-16 md:grid md:grid-cols-3 md:gap-x-[13px] md:gap-y-[13px]"
        >
          <div
            className="flex overflow-x-auto overflow-y-hidden gap-4 snap-x snap-mandatory scroll-smooth scrollbar-hide md:contents"
          >
          {recipes.map((r, idx) => {
            const cardUrl = r.image ? urlForSizedImage(r.image, 800) : null;
            let raw = (r.url ?? "").trim();
            // Avoid double-prefix: "recipes" → "/recipes", "recipes/slug" → "/recipes/slug"
            if (raw && !raw.startsWith("/") && !raw.startsWith("#") && !raw.startsWith("http")) {
              if (raw === "recipes" || raw.startsWith("recipes/")) {
                raw = `/${raw}`;
              }
            }
            const isAbsoluteUrl =
              raw.startsWith("http://") || raw.startsWith("https://");
            const href =
              !raw
                ? "#"
                : raw.startsWith("/") || raw.startsWith("#") || isAbsoluteUrl
                  ? safeHref(raw) || "#"
                  : safeHref(`/recipes/${raw}`) || "#";
            return (
              <Link
                key={idx}
                href={href}
                className="section-card group flex shrink-0 w-[min(280px,78vw)] snap-center min-w-0 max-w-[387px] flex-col overflow-hidden transition-all duration-200 hover:scale-[1.02] md:shrink-0 md:w-full md:max-w-[387px]"
                style={{ backgroundColor: bgColor }}
              >
                <div
                  className="min-w-0 w-full shrink-0 overflow-hidden"
                  style={{
                    height: 320,
                    alignSelf: "stretch",
                    borderRadius: 10,
                    background: cardUrl
                      ? `url(${cardUrl}) lightgray 50% / cover no-repeat`
                      : "lightgray",
                  }}
                  role={cardUrl ? undefined : "img"}
                  aria-label={cardUrl ? undefined : (r.title ?? "Recipe")}
                />
                <div
                  className="px-4 py-3"
                  style={{ backgroundColor: bgColor }}
                >
                  <h3 className="recipe-card-title">
                    {r.title ?? "Recipe"}
                  </h3>
                </div>
              </Link>
            );
          })}
          </div>
        <div className="mt-10 mb-10 flex w-full justify-center md:col-start-1 md:row-start-2 md:justify-start">
          <Link
            href={safeHref(showMoreUrl) || "/recipes"}
            className="inline-flex items-center gap-1.5 hover:opacity-90 w-fit"
            style={SHOW_MORE_LINK_STYLE}
          >
          Show more recipes
          <img
            src="/Vector.svg"
            alt=""
            aria-hidden
            width={28.333}
            height={12.307}
            className="shrink-0 max-w-full h-auto"
          />
          </Link>
        </div>
        </div>
      </div>
      <div
        className="relative top-[60px] -mt-12 -mb-2 w-full shrink-0 md:top-[100px] md:-mt-8"
        style={{ transform: "scaleX(1.10) rotate(-5deg) translateZ(0)" }}
      >
        <WaveDivider
          navySrc="/VectorWavyNavyOurStory.svg"
          wrapperClassName="mt-3 -mb-px [background-color:transparent]"
          navyOutline="top"
        />
        <WaveDivider
          navySrc="/VectorWavyNavy.svg"
          wrapperClassName="-mt-px [background-color:transparent]"
          navyOutline="bottom"
        />
      </div>
    </section>
  );
}
