import Link from "next/link";
import { client, RECIPES_LIST_QUERY, RECIPES_PAGE_CONTENT_QUERY, RECIPE_CATEGORIES_QUERY, PAGE_BY_SLUG_QUERY } from "@/lib/sanity";
import { PageBuilder } from "@/components/sections/PageBuilder";
import { RecipesPageClient } from "./RecipesPageClient";

const LIGHT_BG = "var(--brand-light-blue-bg)";

type RecipeFromSanity = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: { asset?: { _ref?: string } };
  ingredientCategorySlugs?: (string | null)[];
};

type RecipeListItem = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: { asset?: { _ref?: string } };
  categories: string[];
};

type RecipesPageContent = {
  title?: string | null;
  description?: string | null;
  backgroundColor?: string | null;
} | null;

type RecipeCategoryOption = { value: string; label: string };

export const metadata = {
  title: "Recipes",
  description: "Wild Alaskan seafood recipes.",
};

export default async function RecipesIndexPage() {
  let recipesRaw: RecipeFromSanity[] = [];
  let pageContent: RecipesPageContent = null;
  let categoryOptions: RecipeCategoryOption[] = [];
  let sanityPage: { sections?: unknown[] } | null = null;
  if (client) {
    try {
      [recipesRaw, pageContent, categoryOptions, sanityPage] = await Promise.all([
        client.fetch<RecipeFromSanity[]>(RECIPES_LIST_QUERY),
        client.fetch<RecipesPageContent>(RECIPES_PAGE_CONTENT_QUERY),
        client.fetch<RecipeCategoryOption[]>(RECIPE_CATEGORIES_QUERY).then((list) => list ?? []),
        client.fetch<{ sections?: unknown[] } | null>(PAGE_BY_SLUG_QUERY, { slug: "recipes" }).then((p) => p ?? null),
      ]);
    } catch {
      recipesRaw = [];
      pageContent = null;
      categoryOptions = [];
      sanityPage = null;
    }
  }

  const sections = Array.isArray(sanityPage?.sections) ? sanityPage.sections : [];
  const restSections = sections.filter(
    (s) =>
      typeof s !== "object" || (s as { _type?: string })._type !== "recipesBlock"
  );

  const recipes: RecipeListItem[] = recipesRaw.map((r) => {
    const slugs = (r.ingredientCategorySlugs ?? []).map((s) => (s ?? "").trim()).filter(Boolean);
    const categories = [...new Set(slugs)];
    return {
      _id: r._id,
      title: r.title,
      slug: r.slug,
      mainImage: r.mainImage,
      categories,
    };
  });

  const title = (pageContent?.title ?? "").trim() || "Recipes";
  const description = (pageContent?.description ?? "").trim() || "Wild-caught seafood recipes from our kitchen to yours.";
  const bgColor = (pageContent?.backgroundColor ?? "").trim() || LIGHT_BG;

  return (
    <main className="pt-[140px] pb-14 sm:pt-[170px] md:pt-[230px]">
      <div
        className="px-4 pb-10 mx-auto max-w-6xl"
        style={{ backgroundColor: bgColor }}
      >
        <h1
          className="mb-2 text-center"
          style={{
            color: "#111827",
            fontFamily: "Inter, sans-serif",
            fontSize: "48px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h1>
        <p
          className="mb-10 mx-auto text-center w-full max-w-[743px]"
          style={{
            color: "#1E1E1E",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "150%",
          }}
        >
          {description}
        </p>
        <RecipesPageClient recipes={recipes} bgColor={bgColor} categoryOptions={categoryOptions} />
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center no-underline font-medium transition-opacity hover:opacity-90"
            style={{
              width: 158,
              height: 45,
              padding: "11px 42px",
              borderRadius: 20,
              background: "var(--Blue-Inactive-Button, rgba(73, 140, 203, 0.25))",
              color: "var(--brand-navy, #1e3a5f)",
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
      {restSections.length > 0 && (
        <PageBuilder
          sections={restSections as Parameters<typeof PageBuilder>[0]["sections"]}
          promoBanner={null}
        />
      )}
    </main>
  );
}
