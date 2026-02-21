import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

const RECIPES_TOP_PADDING_PX = 56;
const RECIPES_BG = "#D4F2FF";
const SHOW_MORE_LINK_STYLE = {
  color: "#498CCB",
  fontFamily: "Inter, var(--font-inter), sans-serif",
  fontSize: "16px",
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

  return (
    <section
      id="recipes"
      className="relative z-0 mx-auto flex min-w-0 flex-col justify-start pb-16"
      style={{ backgroundColor: RECIPES_BG, width: "100%", minHeight: 723 }}
    >
      <div
          className="mx-auto w-full max-w-full px-0"
        style={{
          paddingTop: RECIPES_TOP_PADDING_PX,
        }}
      >
        <SectionHeading
            title={title}
            description={description || undefined}
            variant="display"
            theme="light"
        />
        <div className="mt-8 flex flex-col">
          <div className="flex flex-wrap justify-center gap-[13px]">
              {recipes.map((r, idx) => {
                const img = urlFor(r.image);
                const href = safeHref(r.url) || "#";
                return (
                  <Link
                    key={idx}
                    href={href}
                    className="group flex min-w-[280px] max-w-[387px] flex-1 flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {img && (
                      <div className="aspect-[331/190] min-w-0 w-full shrink-0 overflow-hidden bg-slate-100">
                        <img
                          src={img.url()}
                          alt={r.title ?? "Recipe"}
                          className="h-full w-full max-w-full min-w-0 object-cover transition-transform group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div
                      className="px-4 py-3"
                      style={{ backgroundColor: RECIPES_BG }}
                    >
                      <h3 className="font-semibold text-slate-900">
                        {r.title ?? "Recipe"}
                      </h3>
                    </div>
                  </Link>
                );
            })}
          </div>
          <Link
              href={safeHref(showMoreUrl) || "#"}
              className="mt-10 mb-10 ml-[131px] self-start inline-flex items-center gap-1.5 hover:opacity-90"
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
    </section>
  );
}
