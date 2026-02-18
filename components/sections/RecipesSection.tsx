import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type Recipe = { title?: string; image?: { asset?: { _ref?: string } }; url?: string };

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
    <>
    <section
      id="recipes"
      className="relative z-0 flex min-h-[723px] min-w-[1440px] flex-col justify-start bg-[#D4F2FF] pb-0 border-4 border-black"
      style={{ minHeight: 723, minWidth: 1440 }}
    >
      <div
        className="mx-auto w-full px-4 pt-[56px]"
        style={{ maxWidth: 1440 }}
      >
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />
        <div className="mt-8 flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[13px]">
            {recipes.map((r, idx) => {
              const img = urlFor(r.image);
              const href = safeHref(r.url) || "#";
              return (
                <Link
                  key={idx}
                  href={href}
                  className="group flex w-full flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {img && (
                    <div className="aspect-[331/190] w-full shrink-0 overflow-hidden bg-slate-100">
                      <img
                        src={img.url()}
                        alt={r.title ?? "Recipe"}
                        className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="bg-[#D4F2FF] px-4 py-3">
                    <h3 className="font-semibold text-slate-900">{r.title ?? "Recipe"}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link
            href={safeHref(showMoreUrl) || "#"}
            className="mt-10 self-start inline-flex items-center gap-1.5 hover:opacity-90"
            style={{
              color: "#498CCB",
              fontFamily: "Inter, var(--font-inter), sans-serif",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
            }}
          >
            Show more recipes
            <img src="/Vector.svg" alt="" aria-hidden width={28.333} height={12.307} className="shrink-0" />
          </Link>
        </div>
      </div>
    </section>

    <section className="relative z-20 w-full -mt-[360px] overflow-hidden leading-[0] border-2 border-pink-500 origin-bottom scale-y-75 -mb-[120px] sm:-mb-[140px] md:-mb-[160px] lg:-mb-[200px]" aria-hidden>
      <img
        src="/VectorWavyBlueRecipes.svg"
        alt=""
        aria-hidden
        className="relative -z-[1] block w-full h-auto min-h-0 align-bottom"
      />
      <img
        src="/VectorWavyNavyRecipes.svg"
        alt=""
        aria-hidden
        className="relative z-10 block w-full h-auto min-h-0 align-bottom -mt-[350px] sm:-mt-[402px] md:-mt-[458px] lg:-mt-[550px]"
      />
    </section>
    </>
  );
}
