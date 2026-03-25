import Link from "next/link";
import { client } from "@/lib/sanity";
import { fetchPdpRecipeCards } from "@/lib/pdpProductRecipes";
import { urlFor } from "@/lib/sanityImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShopSectionWave } from "@/app/shop/ShopSectionWave";

const LIGHT_BG = "var(--brand-light-blue-bg)";

export async function PdpRecipesSection({
  handle,
  hideRecipesSection,
}: {
  handle: string;
  hideRecipesSection: boolean;
}) {
  if (hideRecipesSection || !client) {
    return null;
  }

  let recipesToShow: Awaited<ReturnType<typeof fetchPdpRecipeCards>> = [];
  try {
    recipesToShow = await fetchPdpRecipeCards(client, handle);
  } catch {
    recipesToShow = [];
  }

  return (
    <>
      <ShopSectionWave />

      <section
        className="px-4 py-12 md:py-16"
        style={{
          backgroundColor: LIGHT_BG,
          paddingTop: "clamp(8rem, 16vw, 12rem)",
          paddingBottom: "clamp(6rem, 14vw, 10rem)",
          ["--section-bg" as string]: LIGHT_BG,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-4">
          <SectionHeading
            title="Wild Flavor Starts Here"
            description="Get inspired with simple, delicious ways to prepare your catch."
            variant="section"
          />
          {recipesToShow.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {recipesToShow.map((r) => {
                const img = urlFor(r.mainImage);
                const slug = r.slug?.trim();
                return (
                  <Link
                    key={r._id}
                    href={slug ? `/recipes/${slug}` : "/recipes"}
                    className="section-card overflow-hidden transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: "var(--section-bg)" }}
                  >
                    <div
                      className="aspect-square overflow-hidden"
                      style={{ backgroundColor: "var(--section-bg)" }}
                    >
                      {img ? (
                        <img
                          src={img.width(400).url()}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{ backgroundColor: "var(--section-bg)" }}
                        />
                      )}
                    </div>
                    <p
                      className="recipe-card-title p-3 text-center"
                      style={{ backgroundColor: "var(--section-bg)" }}
                    >
                      {r.title ?? "Recipe"}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-center text-sm text-slate-600">
              Check out our recipes for inspiration.
            </p>
          )}
          <p className="mt-6 text-center">
            <Link
              href="/recipes"
              className="inline-flex items-center justify-center gap-1.5 hover:underline"
              style={{
                color: "#498CCB",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "1rem",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              Show more recipes
              <svg
                width="29"
                height="13"
                viewBox="0 0 29 13"
                fill="#498CCB"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
                className="shrink-0"
              >
                <path d="M22.0383 12.3065L21.1121 11.4128L25.8492 6.76284H0V5.51281H25.8908L21.1217 0.89375L22.0063 0L28.3333 6.13762L22.0383 12.3065Z" />
              </svg>
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
