import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client, EXPLORE_PRODUCTS_BLOCK_QUERY } from "@/lib/sanity";
import { urlFor } from "@/lib/sanityImage";
import { PortableText } from "next-sanity";
import { youtubePortableTextComponents } from "@/components/portableText/youtubePortableText";
import { ExploreProductsSection } from "@/components/sections/ExploreProductsSection";
import { BackToRecipesLink } from "@/components/BackToRecipesLink";

const BASIC_BY_SLUG_QUERY = `*[_type == "basic" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  image { asset-> },
  body,
  sections[] {
    row,
    column,
    heading,
    subtitle,
    listItems,
    body,
    image { asset-> }
  }
}`;

type BasicSection = {
  row?: "top" | "bottom" | null;
  column?: "left" | "right" | null;
  heading?: string | null;
  subtitle?: string | null;
  listItems?: (string | null)[] | null;
  body?: unknown[] | null;
  image?: { asset?: { _ref?: string } } | null;
};

type BasicData = {
  _id: string;
  title?: string;
  slug?: string;
  image?: { asset?: { _ref?: string } };
  body?: unknown[];
  sections?: BasicSection[] | null;
};

type ExploreProductsBlockType = {
  _type?: string;
  _key?: string;
  backgroundColor?: string;
  hideWave?: boolean;
  title?: string;
  description?: string;
  filterCollections?: Array<{
    label?: string;
    collectionHandle?: string;
    image?: { asset?: { _ref?: string } };
  }>;
};

const BG_COLOR = "var(--brand-light-blue-bg)";
const TEXT_COLOR = "#1E1E1E";
const SUBTITLE_COLOR = "#498CCB";
const BODY_COLOR_SECONDARY = "#374151";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!client) return { title: "Basic" };
  try {
    const basic = await client.fetch<BasicData | null>(BASIC_BY_SLUG_QUERY, {
      slug,
    });
    const title = basic?.title ?? "Basic";
    return { title: `${title} — The Basics` };
  } catch {
    return { title: "The Basics" };
  }
}

function BasicSectionBlock({
  section,
  bodyColor = TEXT_COLOR,
}: {
  section: BasicSection;
  bodyColor?: string;
}) {
  const hasList = section.listItems && section.listItems.length > 0;
  const hasBody =
    section.body && Array.isArray(section.body) && section.body.length > 0;
  const img = section.image ? urlFor(section.image) : null;
  const imageUrl = img ? img.url() : null;

  return (
    <div className="mb-10 last:mb-0">
      {section.heading && (
        <h2
          className="mb-1 capitalize"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1.5,
            color: TEXT_COLOR,
          }}
        >
          {section.heading}
        </h2>
      )}
      {section.subtitle && (
        <p
          className="mb-3 italic"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "1rem",
            fontWeight: 300,
            color: SUBTITLE_COLOR,
          }}
        >
          {section.subtitle}
        </p>
      )}
      {hasList && (
        <ul
          className="list-disc pl-6 mb-4"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "1rem",
            color: bodyColor,
            lineHeight: 2,
          }}
        >
          {section.listItems!.filter(Boolean).map((item, i) => (
            <li key={i} className="mb-0">
              {item}
            </li>
          ))}
        </ul>
      )}
      {hasBody && (
        <div
          className="basic-section-body [&_p]:mt-4 [&_p]:first:mt-0 [&_p]:whitespace-pre-wrap"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: bodyColor,
          }}
        >
          <PortableText
            value={
              section.body as import("@portabletext/types").PortableTextBlock[]
            }
            components={youtubePortableTextComponents()}
          />
        </div>
      )}
      {imageUrl && (
        <div className="mt-4 overflow-hidden rounded-[10px] w-full max-w-[462px] aspect-[462/308]">
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}

export default async function BasicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!client) notFound();

  let basic: BasicData | null = null;
  let exploreProductsBlock: ExploreProductsBlockType | null = null;
  if (client) {
    try {
      [basic, exploreProductsBlock] = await Promise.all([
        client.fetch<BasicData | null>(BASIC_BY_SLUG_QUERY, { slug }),
        client.fetch<ExploreProductsBlockType | null>(
          EXPLORE_PRODUCTS_BLOCK_QUERY,
        ),
      ]);
    } catch {
      basic = null;
      exploreProductsBlock = null;
    }
  }
  if (!basic) notFound();

  const heroImageUrl = basic.image
    ? (urlFor(basic.image)?.url() ?? null)
    : null;
  const sections = basic.sections ?? [];
  const topSections = sections.filter((s) => (s.row ?? "top") === "top");
  const bottomLeftSections = sections.filter(
    (s) => s.row === "bottom" && (s.column ?? "left") === "left",
  );
  const bottomRightSections = sections.filter(
    (s) => s.row === "bottom" && s.column === "right",
  );
  const hasTopSections = topSections.length > 0;
  const hasBottomSections =
    bottomLeftSections.length > 0 || bottomRightSections.length > 0;

  return (
    <main className="bg-white">
      {/* Match product page: same padding below header wave so content start position aligns */}
      <section
        className="px-4 pt-[140px] pb-10 sm:pt-[170px] sm:pb-10 md:py-14 lg:pt-[230px] lg:pb-14"
        style={{ backgroundColor: BG_COLOR }}
      >
        <div className="mx-auto max-w-6xl">
          {/* Two columns: image left, title + sections right (sections under the title) */}
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            {heroImageUrl ? (
              <div
                className="max-w-full overflow-hidden rounded-[10px]"
                style={{
                  width: "min(661px, 100%)",
                  aspectRatio: "1/1",
                  background: `url(${heroImageUrl}) lightgray 50% / cover no-repeat`,
                }}
                role="img"
                aria-label={basic.title ?? "Hero image"}
              />
            ) : (
              <div />
            )}
            <div>
              <p
                className="text-sm font-medium text-slate-500 uppercase tracking-wide"
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
              >
                The Basics
              </p>
              <h1
                className="mt-2"
                style={{
                  color: "var(--Text-Color, #1E1E1E)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "2.5rem",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "normal",
                }}
              >
                {basic.title ?? "Basic"}
              </h1>
              {hasTopSections && (
                <div className="mt-10 space-y-10">
                  {topSections.map((section, i) => (
                    <BasicSectionBlock
                      key={i}
                      section={section}
                      bodyColor={TEXT_COLOR}
                    />
                  ))}
                </div>
              )}
              {hasTopSections && !hasBottomSections && (
                <div className="mt-8">
                  <BackToRecipesLink />
                </div>
              )}
            </div>
          </div>

          {hasBottomSections && (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 mt-16">
              <div className="space-y-10">
                {bottomLeftSections.map((section, i) => (
                  <BasicSectionBlock
                    key={i}
                    section={section}
                    bodyColor={TEXT_COLOR}
                  />
                ))}
              </div>
              <div className="flex h-full min-h-0 flex-col">
                {bottomRightSections.length > 0 && (
                  <div className="space-y-10">
                    {bottomRightSections.map((section, i) => (
                      <BasicSectionBlock
                        key={i}
                        section={section}
                        bodyColor={BODY_COLOR_SECONDARY}
                      />
                    ))}
                  </div>
                )}
                <div
                  className={
                    bottomRightSections.length > 0
                      ? "mt-8"
                      : "mt-6 lg:mt-auto lg:pt-0"
                  }
                >
                  <BackToRecipesLink />
                </div>
              </div>
            </div>
          )}

          {!hasTopSections && !hasBottomSections && (
            <>
              {basic.body &&
                Array.isArray(basic.body) &&
                basic.body.length > 0 && (
                  <>
                    <div
                      className="prose prose-slate mx-auto max-w-3xl [&_p]:text-[16px] [&_p]:leading-[1.6] [&_p]:text-[#1E1E1E]"
                      style={{ color: TEXT_COLOR }}
                    >
                      <PortableText
                        value={
                          basic.body as import("@portabletext/types").PortableTextBlock[]
                        }
                        components={youtubePortableTextComponents()}
                      />
                    </div>
                    <div className="mx-auto mt-8 max-w-3xl">
                      <BackToRecipesLink />
                    </div>
                  </>
                )}
            </>
          )}
        </div>
      </section>

      <ExploreProductsSection
        block={{
          ...(exploreProductsBlock ?? {}),
          backgroundColor: exploreProductsBlock?.backgroundColor ?? "#F2F2F5",
        }}
        hideExploreProductsWave={true}
      />
    </main>
  );
}
