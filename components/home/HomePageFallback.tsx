/**
 * Fallback home UI when Sanity has no homepage sections (or Sanity env is missing).
 * Invoked from `app/page.tsx` after a Shopify query for featured products.
 *
 * Not CMS-editable: hero copy, about text, and section order are fixed here.
 * Product carousel tiles use live Shopify images/titles; promo banner still comes
 * from Sanity site settings when the parent fetch succeeded.
 */
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PromoBanner } from "@/components/PromoBanner";
import { Carousel } from "@/app/components/Carousel";
import { HeroCarousel } from "@/app/components/HeroCarousel";
import { PLACEHOLDER_HERO_CAROUSEL_ITEMS } from "@/lib/homeHeroPreloadUrl";
import type { ShopifyHomeProductsResponse } from "@/lib/shopifyHomeProductsQuery";

const ABOUT_IMG =
  "https://images.unsplash.com/photo-1520975869018-1d9d275b4020?auto=format&fit=crop&w=1200&q=80";

type Props = {
  products: ShopifyHomeProductsResponse["products"]["edges"];
  promoBanner?: string | null;
  promoBannerUrl?: string | null;
};

export function HomePageFallback({
  products,
  promoBanner,
  promoBannerUrl,
}: Props) {
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
        headlineLine1={"From Alaska's Waters to Your Table"}
        headlineLine2={""}
        subline={"Wild-caught  •  Family-run  •  Sustainably sourced"}
        ctaLabel={"Get Fresh Fish"}
        ctaHref={"#shop"}
        items={PLACEHOLDER_HERO_CAROUSEL_ITEMS}
      />
      {promoBanner && <PromoBanner text={promoBanner} href={promoBannerUrl} />}

      <section id="about" className="scroll-mt-[110px] bg-white py-14 sm:scroll-mt-[140px]">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading title="We are Hook Point" variant="display" theme="light" />
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-card bg-slate-200 h-[300px] md:h-[420px]">
              <Image
                src={ABOUT_IMG}
                alt="Fishing crew"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-6 text-slate-700">
                At Hook Point Fisheries, fishing isn&apos;t just a job—it&apos;s our
                way of life. Every summer we carefully fish the waters off
                Kodiak Island, hand-harvesting wild Alaskan salmon and other
                seafood for folks like you.
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                We believe the real food brings people together, and when you
                choose our salmon, you&apos;re supporting sustainable harvest,
                local families, and small boat fisheries.
              </p>
              <div className="mt-6">
                <a href="#learn" className="btn-primary">
                  Learn More About Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            title="Let us be your fishermen. The possibilities are endless…"
            variant="display"
            theme="light"
          />
          <div className="mt-6">
            <Carousel items={carouselItems.slice(0, 10)} ariaLabel="Featured seafood" />
          </div>
          <div className="mt-6 flex justify-center">
            <a href="#shop" className="btn-primary">
              Shop Hook Point Fish
            </a>
          </div>
        </div>
      </section>

      <section id="shop" className="py-14" style={{ backgroundColor: "var(--brand-navy)" }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Shop seafood
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Curated wild catch from Alaska&apos;s small-boat fleet.
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
              <p className="text-lg text-slate-300">No products found.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 9).map(({ node: product }) => {
                const img = product.images.edges[0]?.node;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.handle}`}
                    prefetch
                    className="group rounded-card border border-black/5 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-slate-100">
                      {img?.url ? (
                        <Image
                          src={img.url}
                          alt={img.altText ?? product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                        ${Math.round(parseFloat(product.priceRange.minVariantPrice.amount)).toString()}{" "}
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
          <SectionHeading
            title="Find us at these Chicagoland Farmers Markets"
            variant="display"
            theme="light"
          />
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
                className="flex items-center justify-center rounded-card border border-black/5 bg-slate-50 p-5 text-xs font-semibold text-slate-700"
              >
                {name}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <a href="#contact" className="btn-primary">
              Pick Fresh Farmers Markets and Event Calendar
            </a>
          </div>
        </div>
      </section>

      <section id="learn" className="py-14 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-700/90" />
          <div className="mt-4">
            <SectionHeading
              title="Get on board"
              description="Subscribe to get updates on fresh drops and fishy stories."
              variant="display"
              theme="light"
            />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <input
              type="email"
              placeholder="Email"
              className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-sky-700 sm:w-[380px]"
            />
            <button type="button" className="btn-primary">
              Sign up
            </button>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            title="Follow Our Journey on Instagram"
            variant="display"
            theme="light"
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {carouselItems.slice(0, 12).map((i, idx) => (
              <div
                key={`${i.src}-${idx}`}
                className="relative aspect-square overflow-hidden rounded-card bg-slate-200"
              >
                <Image
                  src={i.src}
                  alt={i.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
