"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { urlFor } from "@/lib/sanityImage";

const DEFAULT_CATEGORY_FILTERS = [
  { label: "Salmon", value: "salmon" },
  { label: "Sablefish", value: "sablefish" },
  { label: "Halibut", value: "halibut" },
  { label: "Scallops", value: "scallops" },
  { label: "Cod", value: "cod" },
  { label: "Seafood", value: "seafood" },
  { label: "Smoked", value: "smoked" },
];

const FILTER_BUTTON_BASE =
  "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap border-none cursor-pointer";

type RecipeItem = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: { asset?: { _ref?: string } };
  categories: string[];
};

export function RecipesPageClient({
  recipes,
  bgColor,
  categoryOptions = [],
}: {
  recipes: RecipeItem[];
  bgColor: string;
  /** Categories from Sanity (Recipe Categories). Used for filter buttons. Falls back to default list if empty. */
  categoryOptions?: Array<{ value: string; label: string }>;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const filters = categoryOptions.length > 0 ? categoryOptions : DEFAULT_CATEGORY_FILTERS;

  const filteredRecipes = useMemo(() => {
    if (!selectedCategory) return recipes;
    return recipes.filter((r) => r.categories.includes(selectedCategory));
  }, [recipes, selectedCategory]);

  return (
    <>
      <div
        className="mb-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter recipes by category"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={FILTER_BUTTON_BASE}
          style={{
            backgroundColor: selectedCategory === null ? "#1e3a5f" : "rgba(212, 242, 255, 0.9)",
            color: selectedCategory === null ? "#fff" : "#1e3a5f",
            fontFamily: "Inter, var(--font-inter), sans-serif",
          }}
        >
          All
        </button>
        {filters.map(({ label, value }) => {
          const isSelected = selectedCategory === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedCategory(value)}
              className={FILTER_BUTTON_BASE}
              style={{
                backgroundColor: isSelected ? "#1e3a5f" : "rgba(212, 242, 255, 0.9)",
                color: isSelected ? "#fff" : "#1e3a5f",
                fontFamily: "Inter, var(--font-inter), sans-serif",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filteredRecipes.length === 0 ? (
        <p className="text-slate-600">
          {selectedCategory
            ? `No recipes in this category yet. Try another filter or “All”.`
            : "No recipes yet. Check back soon."}
        </p>
      ) : (
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {filteredRecipes.map((r) => {
            const slug = r.slug ?? "";
            const href = slug ? `/recipes/${slug}` : "#";
            let imageUrl: string | null = null;
            try {
              const u = urlFor(r.mainImage);
              if (u) imageUrl = u.url();
            } catch {
              // ignore
            }
            const cardBackground =
              imageUrl != null && imageUrl !== ""
                ? { background: `url(${imageUrl}) center / cover no-repeat` }
                : undefined;
            return (
              <Link
                key={r._id}
                href={href}
                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="h-48 w-full shrink-0 bg-slate-200"
                  style={cardBackground}
                />
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-semibold text-slate-900">
                    {r.title ?? "Recipe"}
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
