import { client, RECIPES_LIST_QUERY, RECIPES_PAGE_CONTENT_QUERY, RECIPE_CATEGORIES_QUERY, PAGE_BY_SLUG_QUERY, EXPLORE_PRODUCTS_BLOCK_QUERY } from "@/lib/sanity";
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
  block?: {
    title?: string | null;
    description?: string | null;
    backgroundColor?: string | null;
  } | null;
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
  let canonicalExploreProductsBlock: Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"] = null;
  if (client) {
    try {
      [recipesRaw, pageContent, categoryOptions, sanityPage, canonicalExploreProductsBlock] = await Promise.all([
        client.fetch<RecipeFromSanity[]>(RECIPES_LIST_QUERY),
        client.fetch<RecipesPageContent>(RECIPES_PAGE_CONTENT_QUERY),
        client.fetch<RecipeCategoryOption[]>(RECIPE_CATEGORIES_QUERY).then((list) => list ?? []),
        client.fetch<{ sections?: unknown[] } | null>(PAGE_BY_SLUG_QUERY, { slug: "recipes" }).then((p) => p ?? null),
        client.fetch<Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"]>(EXPLORE_PRODUCTS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
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

  const title =
    (pageContent?.title ?? "").trim() ||
    (pageContent?.block?.title ?? "").trim() ||
    "Recipes";
  const description =
    (pageContent?.description ?? "").trim() ||
    (pageContent?.block?.description ?? "").trim() ||
    "Wild-caught seafood recipes from our kitchen to yours.";
  const bgColor =
    (pageContent?.block?.backgroundColor ?? "").trim() || LIGHT_BG;

  return (
    <main
        className={`pt-[140px] sm:pt-[170px] md:pt-[230px] ${restSections.length > 0 ? "pb-0" : "pb-14"}`}
        style={{ backgroundColor: bgColor, ["--section-bg" as string]: bgColor }}
      >
      <div className="w-full pb-10" style={{ backgroundColor: bgColor }}>
        <div className="mx-auto w-full max-w-[1200px] px-4">
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
        </div>
      </div>
      {restSections.length > 0 && (
        <PageBuilder
          sections={restSections as Parameters<typeof PageBuilder>[0]["sections"]}
          promoBanner={null}
          pageSlug="recipes"
          canonicalExploreProductsBlock={canonicalExploreProductsBlock}
        />
      )}
    </main>
  );
}
