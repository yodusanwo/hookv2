import { ContactForm } from "./ContactForm";
import { PageBuilder } from "@/components/sections/PageBuilder";
import { client, CONTACT_PAGE_QUERY, EXPLORE_PRODUCTS_BLOCK_QUERY } from "@/lib/sanity";

export const metadata = {
  title: "Contact | Hook Point",
  description:
    "Get in touch with Hook Point Fisheries. We love talking fish and are happy to answer your questions.",
};

export default async function ContactPage() {
  let sanityPage: { sections?: unknown[] } | null = null;
  const hasSanity =
    !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_SANITY_DATASET;

  let canonicalExploreProductsBlock: Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"] = null;
  if (hasSanity) {
    try {
      [sanityPage, canonicalExploreProductsBlock] = await Promise.all([
        client.fetch<{ sections?: unknown[] } | null>(
          CONTACT_PAGE_QUERY,
          {},
          { next: { revalidate: 60 } }
        ),
        client.fetch<Parameters<typeof PageBuilder>[0]["canonicalExploreProductsBlock"]>(EXPLORE_PRODUCTS_BLOCK_QUERY, {}, { next: { revalidate: 60 } }),
      ]);
    } catch {
      // Use fallback below
    }
  }

  if (
    sanityPage?.sections &&
    Array.isArray(sanityPage.sections) &&
    sanityPage.sections.length > 0
  ) {
    return (
      <main className="bg-white">
        <PageBuilder
          sections={sanityPage.sections as Parameters<typeof PageBuilder>[0]["sections"]}
          promoBanner={null}
          canonicalExploreProductsBlock={canonicalExploreProductsBlock}
        />
      </main>
    );
  }

  return (
    <main className="bg-white">
      <section
        id="contact-page"
        className="relative z-10 min-h-[780px] pt-[176px] pb-14 md:pt-[208px] md:pb-20"
        style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
      >
        <div className="mx-auto max-w-[782px] px-4 text-center">
          <h1
            className="font-semibold uppercase leading-normal text-[#111827]"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "48px",
              lineHeight: 1,
            }}
          >
            Contact Us
          </h1>
          <p
            className="mx-auto mt-6 max-w-[426px] text-center text-[16px] font-normal leading-[1.5] text-[#1e1e1e]"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            Have a question? Drop a line anytime. We love talking fish and are
            happy to answer your questions.
          </p>
        </div>

        <div className="mx-auto max-w-[1065px] px-4 pt-14">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
