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
  "text-sm font-semibold transition-colors border-none cursor-pointer inline-flex items-center justify-center";
const FILTER_BUTTON_LAYOUT = {
  width: 158,
  height: 45,
  padding: "11px 42px",
  borderRadius: 20,
};
const FILTER_BUTTON_INACTIVE_BG = "var(--Blue-Inactive-Button, rgba(73, 140, 203, 0.25))";

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
            ...FILTER_BUTTON_LAYOUT,
            backgroundColor: selectedCategory === null ? "#1e3a5f" : FILTER_BUTTON_INACTIVE_BG,
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
                ...FILTER_BUTTON_LAYOUT,
                backgroundColor: isSelected ? "#1e3a5f" : FILTER_BUTTON_INACTIVE_BG,
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
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
            const imageStyle = {
              height: "320px",
              alignSelf: "stretch" as const,
              borderRadius: 10,
              background:
                imageUrl != null && imageUrl !== ""
                  ? `url(${imageUrl}) lightgray 50% / cover no-repeat`
                  : "lightgray",
            };
            return (
              <Link
                key={r._id}
                href={href}
                className="section-card group flex flex-col overflow-hidden rounded-xl transition-shadow"
                style={{ backgroundColor: "var(--section-bg)" }}
              >
                <div
                  className="min-w-0 w-full shrink-0 overflow-hidden transition-transform group-hover:scale-[1.03]"
                  style={imageStyle}
                />
                <div
                  className="flex flex-1 flex-col p-4"
                  style={{ backgroundColor: "var(--section-bg)" }}
                >
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
