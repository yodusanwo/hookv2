import Link from "next/link";
import { client, RECIPES_LIST_QUERY } from "@/lib/sanity";
import { urlFor } from "@/lib/sanityImage";

const LIGHT_BG = "var(--brand-light-blue-bg)";

type RecipeListItem = {
  _id: string;
  title?: string;
  slug?: string;
  mainImage?: { asset?: { _ref?: string } };
};

export const metadata = {
  title: "Recipes",
  description: "Wild Alaskan seafood recipes.",
};

export default async function RecipesIndexPage() {
  let recipes: RecipeListItem[] = [];
  if (client) {
    try {
      recipes = await client.fetch<RecipeListItem[]>(RECIPES_LIST_QUERY);
    } catch {
      recipes = [];
    }
  }

  return (
    <main
      className="px-4 pt-[140px] pb-14 sm:pt-[170px] md:pt-[230px]"
      style={{ backgroundColor: LIGHT_BG }}
    >
      <div className="mx-auto max-w-6xl">
        <h1
          className="mb-2"
          style={{
            color: "var(--Text-Color, #1E1E1E)",
            fontFamily: "Inter, sans-serif",
            fontSize: "40px",
            fontWeight: 500,
          }}
        >
          Recipes
        </h1>
        <p
          className="mb-10 text-slate-600"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "16px" }}
        >
          Wild-caught seafood recipes from our kitchen to yours.
        </p>
        {recipes.length === 0 ? (
          <p className="text-slate-600">No recipes yet. Check back soon.</p>
        ) : (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {recipes.map((r) => {
              const slug = r.slug ?? "";
              const href = slug ? `/recipes/${slug}` : "#";
              let imageUrl: string | null = null;
              try {
                const u = urlFor(r.mainImage);
                if (u) imageUrl = u.url();
              } catch {
                // ignore
              }
              return (
                <Link
                  key={r._id}
                  href={href}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className="h-48 w-full shrink-0 bg-slate-200"
                    style={
                      imageUrl
                        ? {
                            background: `url(${imageUrl}) center / cover no-repeat`,
                          }
                    }
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
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-[var(--brand-navy)] hover:underline"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "16px" }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
