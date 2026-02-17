import { client, HOMEPAGE_QUERY, SITE_SETTINGS_QUERY } from "@/lib/sanity";
import { PromoBanner } from "@/components/PromoBanner";
import { shopifyFetch } from "@/lib/shopify";
import { Carousel } from "./components/Carousel";
import { HeroCarousel } from "./components/HeroCarousel";
import { PageBuilder } from "@/components/sections/PageBuilder";
import Link from "next/link";

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

type ProductsResponse = {
  products: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        description: string;
        priceRange: {
          minVariantPrice: {
            amount: string;
            currencyCode: string;
          };
        };
        images: {
          edges: Array<{
            node: {
              url: string;
              altText: string | null;
            };
          }>;
        };
        variants: {
          edges: Array<{
            node: {
              id: string;
              availableForSale: boolean;
            };
          }>;
        };
      };
    }>;
  };
};

export default async function Home() {
  try {
    const hasSanity =
      !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      !!process.env.NEXT_PUBLIC_SANITY_DATASET;

    let sanityPage: { sections?: unknown[] } | null = null;
    let promoBanner: string | null = null;

    if (hasSanity) {
      try {
        [sanityPage, promoBanner] = await Promise.all([
          client.fetch<{ sections?: unknown[] } | null>(HOMEPAGE_QUERY, {}, { next: { revalidate: 60 } }),
          client
            .fetch<{ promoBanner?: string } | null>(SITE_SETTINGS_QUERY, {}, { next: { revalidate: 60 } })
            .then((s) => s?.promoBanner ?? null),
        ]);
      } catch (e) {
        console.warn("Sanity fetch failed, using fallback:", e);
      }
    }

    if (sanityPage?.sections && Array.isArray(sanityPage.sections) && sanityPage.sections.length > 0) {
      return (
        <main className="bg-white">
          <PageBuilder
            sections={sanityPage.sections as Parameters<typeof PageBuilder>[0]["sections"]}
            promoBanner={promoBanner}
          />
        </main>
      );
    }

    const data = await shopifyFetch<ProductsResponse>({
      query: PRODUCTS_QUERY,
      variables: { first: 12 },
    });

    const products = data.products.edges;

    let fallbackPromoBanner: string | null = null;
    if (hasSanity) {
      try {
        const settings = await client.fetch<{ promoBanner?: string } | null>(
          SITE_SETTINGS_QUERY,
          {},
          { next: { revalidate: 60 } }
        );
        fallbackPromoBanner = settings?.promoBanner ?? null;
      } catch {
        // ignore
      }
    }
    const heroImg =
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";
    const aboutImg =
      "https://images.unsplash.com/photo-1520975869018-1d9d275b4020?auto=format&fit=crop&w=1200&q=80";

    const carouselItems = products
      .map((p) => {
        const img = p.node.images.edges[0]?.node;
        if (!img?.url) return null;
        return {
          src: img.url,
          alt: img.altText ?? p.node.title,
        };
      })
      .filter(Boolean) as Array<{ src: string; alt: string }>;

    return (
      <main className="bg-white">
        <HeroCarousel
          headlineLine1={"Alaska's Fresh Catch Awaits —"}
          headlineLine2={"Taste the Adventure"}
          subline={"Wild-caught  •  Family-run  •  Sustainably sourced"}
          ctaLabel={"Get Fresh Fish"}
          ctaHref={"#shop"}
          items={[
            { src: heroImg, alt: "Coastal Alaska landscape" },
            { src: "/1A4A6382.jpeg", alt: "Fresh catch on dock" },
            { src: "/1A4A6336.jpeg", alt: "Fresh catch on dock" },
            { src: "/1A4A6336.jpeg", alt: "Fresh catch on dock" },
            { src: "/1A4A6336.jpeg", alt: "Fresh catch on dock" },
            { src: "/1A4A6336.jpeg", alt: "Fresh catch on dock" },
          ]}
        />
        {fallbackPromoBanner && <PromoBanner text={fallbackPromoBanner} />}

        <section id="about" className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                We are Hook Point
              </h2>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="overflow-hidden rounded-xl bg-slate-200">
                <img
                  src={aboutImg}
                  alt="Fishing crew"
                  className="h-[300px] w-full object-cover md:h-[420px]"
                  loading="lazy"
                />
              </div>
              <div className="max-w-xl">
                <p className="text-sm leading-6 text-slate-700">
                  At Hook Point Fisheries, fishing isn't just a job—it's our
                  way of life. Every summer we carefully fish the waters off
                  Kodiak Island, hand-harvesting wild Alaskan salmon and other
                  seafood for folks like you.
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  We believe the real food brings people together, and when you
                  choose our salmon, you're supporting sustainable harvest,
                  local families, and small boat fisheries.
                </p>
                <div className="mt-6">
                  <a
                    href="#learn"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Learn More About Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-slate-50 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h3 className="text-center text-lg font-semibold text-slate-900">
              Let us be your fishermen. The possibilities are endless…
            </h3>
            <div className="mt-6">
              <Carousel items={carouselItems.slice(0, 10)} ariaLabel="Featured seafood" />
            </div>
            <div className="mt-6 flex justify-center">
              <a
                href="#shop"
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Shop Hook Point Fish
              </a>
            </div>
          </div>
        </section>

        <section id="shop" className="py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Shop seafood
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Curated wild catch from Alaska's small-boat fleet.
                </p>
              </div>
              <a
                href="#csa"
                className="hidden sm:inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Shop CSA
              </a>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-slate-700">No products found.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.slice(0, 9).map(({ node: product }) => {
                  const img = product.images.edges[0]?.node;
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.handle}`}
                      className="group rounded-xl border border-black/5 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-slate-100">
                        {img?.url ? (
                          <img
                            src={img.url}
                            alt={img.altText ?? product.title}
                            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {product.title}
                          </h3>
                          {product.variants.edges[0]?.node.availableForSale ? (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              In stock
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              Sold out
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-slate-700">
                          ${product.priceRange.minVariantPrice.amount}{" "}
                          {product.priceRange.minVariantPrice.currencyCode}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section id="markets" className="border-y border-black/5 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
              Find us at these Chicagoland Farmers Markets
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                "Lincoln Park",
                "Uptown",
                "Lakeview",
                "South Loop",
                "Logan Square",
                "Wicker Park",
              ].map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-center rounded-xl border border-black/5 bg-slate-50 p-5 text-xs font-semibold text-slate-700"
                >
                  {name}
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <a
                href="#contact"
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Pick Fresh Farmers Markets and Event Calendar
              </a>
            </div>
          </div>
        </section>

        <section id="learn" className="py-14 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-700/90" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Get on board
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Subscribe to get updates on fresh drops and fishy stories.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <input
                type="email"
                placeholder="Email"
                className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-sky-700 sm:w-[380px]"
              />
              <button className="h-12 rounded-md bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800">
                Sign up
              </button>
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
              Follow Our Journey on Instagram
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {carouselItems.slice(0, 12).map((i, idx) => (
                <div
                  key={`${i.src}-${idx}`}
                  className="aspect-square overflow-hidden rounded-lg bg-slate-200"
                >
                  <img
                    src={i.src}
                    alt={i.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-red-600">
            Error Loading Products
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-mono">
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </main>
    );
  }
}
