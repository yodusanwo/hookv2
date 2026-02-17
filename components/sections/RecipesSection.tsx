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
    <section id="recipes" className="py-14 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recipes.map((r, idx) => {
            const img = urlFor(r.image);
            const href = safeHref(r.url) || "#";
            return (
              <Link
                key={idx}
                href={href}
                className="group overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {img && (
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={img.url()}
                      alt={r.title ?? "Recipe"}
                      className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{r.title ?? "Recipe"}</h3>
                </div>
              </Link>
            );
          })}
        </div>
        {showMoreUrl && (
          <div className="mt-8 flex justify-center">
            <a
              href={safeHref(showMoreUrl)}
              className="btn-primary"
            >
              View All Recipes
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
