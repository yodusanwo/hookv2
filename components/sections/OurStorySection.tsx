import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { PortableText } from "next-sanity";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type OurStoryBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  body?: unknown[];
  image?: { asset?: { _ref?: string } };
  subheading?: string;
  cta?: { label?: string; href?: string };
};

const BODY_STYLE = {
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontSize: "1rem",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "150%",
  color: "#1E1E1E",
} as const;

/** Description text under title: same typography everywhere, color by background (light #1E1E1E, dark #FFFFFF) */
const DESCRIPTION_TYPOGRAPHY = {
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontSize: "1rem",
  fontStyle: "normal" as const,
  fontWeight: 400,
  lineHeight: "150%",
  textAlign: "center" as const,
} as const;

/** Story page only: right-column copy styling */
const STORY_PAGE_COPY_STYLE = {
  color: "var(--White, #FFF)",
  fontFamily: "var(--font-mulish), Mulish, sans-serif",
  fontSize: "1.5rem",
  fontStyle: "normal" as const,
  fontWeight: 300,
  lineHeight: "normal",
};

/** Desktop design: subheadings (Who We Are, From Our Family to Yours) in body */
const OUR_STORY_SUBHEADING_STYLE = {
  color: "#1E1E1E",
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontSize: "1.25rem",
  fontStyle: "normal" as const,
  fontWeight: 500,
  lineHeight: "normal",
} as const;

/** Vertical spacing between body blocks (subheading, paragraph, next subheading, etc.) */
const OUR_STORY_BLOCK_SPACING_PX = 29;

const HOOK_POINT_BODY = (
  <>
    <p style={BODY_STYLE}>
      At Hook Point Fisheries, fishing isn&apos;t just a job—it&apos;s our way
      of life. Every summer we carefully fish the waters off Kodiak Island,
      hand-harvesting wild Alaskan salmon and other seafood for folks like you.
    </p>
    <p style={{ ...BODY_STYLE, marginTop: "16px" }}>
      We believe the real food brings people together, and when you choose our
      salmon, you&apos;re supporting sustainable harvest, local families, and
      small boat fisheries.
    </p>
  </>
);

function isLoremIpsum(body: unknown[] | undefined): boolean {
  if (!body?.length) return false;
  const text = JSON.stringify(body).toLowerCase();
  return (
    text.includes("lorem ipsum") || text.includes("consectetur adipiscing")
  );
}

export function OurStorySection({
  block,
  hideTitle,
  hideCta,
  hideWave,
  variant = "default",
}: {
  block: OurStoryBlock;
  /** When true, the section heading is hidden (e.g. on /story page only). */
  hideTitle?: boolean;
  /** When true, the CTA link is hidden (e.g. on /story page only). */
  hideCta?: boolean;
  /** When true, the wave below the section is hidden (e.g. on /story page only). */
  hideWave?: boolean;
  /** "story-page" = dark bg #171730 + white text on /story only; "default" = unchanged. */
  variant?: "default" | "story-page";
}) {
  const title = block.title ?? "We are Hook Point";
  const subheading = block.subheading ?? "Who We Are";
  const img = urlFor(block.image);
  const hasCtaFromSanity =
    !!block.cta && (!!block.cta.label?.trim() || !!block.cta.href?.trim());
  const rawCtaLabel = block.cta?.label ?? "Meet your fishermen";
  const ctaLabel =
    rawCtaLabel.length > 0
      ? rawCtaLabel.charAt(0).toUpperCase() + rawCtaLabel.slice(1).toLowerCase()
      : "Meet your fishermen";
  const rawHref = block.cta?.href?.trim();
  const ctaHref = rawHref ? safeHref(rawHref) : "#learn";

  const useFallbackBody = !block.body?.length || isLoremIpsum(block.body);
  const isStoryPage = variant === "story-page";

  return (
    <section
      id="about"
      className="relative z-10 flex min-h-0 flex-col justify-end overflow-visible pt-0 pb-0"
      style={{
        backgroundColor: isStoryPage
          ? "#171730"
          : (block.backgroundColor ?? "#d4f2ff"),
      }}
    >
      <div
        className={`mx-auto w-full max-w-6xl px-6 md:px-4 pt-12 pb-12 md:pt-10 md:pb-12 ${isStoryPage ? "md:pl-[2.25rem]" : ""}`}
      >
        {!hideTitle && (
          <>
            <SectionHeading
              title={title}
              variant="display"
              theme={isStoryPage ? "dark" : "light"}
            />
            {block.description ? (
              <p
                className="mt-4 w-full max-w-[770px] mx-auto text-center"
                style={{
                  ...DESCRIPTION_TYPOGRAPHY,
                  color: isStoryPage ? "#FFFFFF" : "#1E1E1E",
                }}
              >
                {block.description}
              </p>
            ) : null}
          </>
        )}
        <div
          className={`grid gap-8 lg:grid-cols-2 lg:items-stretch ${isStoryPage ? "pt-8 md:pt-[6.25rem]" : ""} ${!hideTitle ? "mt-10" : ""}`}
        >
          <div
            className={`min-w-0 overflow-hidden rounded-xl bg-slate-200 ${isStoryPage ? "w-full h-[259.875px] md:w-[86.625%] md:h-[363.825px] md:ml-[4.5625rem]" : ""}`}
          >
            {img ? (
              <img
                src={img.url()}
                alt={hideTitle ? (block.title ?? "Our story") : title}
                className={
                  isStoryPage
                    ? "h-[259.875px] w-full max-w-full object-cover md:h-[363.825px]"
                    : "h-[300px] w-full max-w-full object-cover md:h-[420px]"
                }
                style={{ objectPosition: "center top" }}
                loading="lazy"
              />
            ) : (
              <div
                className={
                  isStoryPage
                    ? "h-[259.875px] w-full md:h-[363.825px]"
                    : "h-[300px] w-full md:h-[420px]"
                }
              />
            )}
          </div>
          <div
            className="min-w-0 flex max-w-xl flex-col justify-center rounded-xl px-6 pb-6 pt-0 lg:px-6"
            style={{
              backgroundColor: isStoryPage
                ? "transparent"
                : (block.backgroundColor ?? "#d4f2ff"),
            }}
          >
            {isStoryPage ? (
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src="/quote.png"
                  alt=""
                  aria-hidden
                  className="-mt-[2.8125rem] h-16 w-10 shrink-0 object-contain sm:h-20 sm:w-12 lg:h-24 lg:w-14"
                />
                <div
                  className="min-w-0 flex-1 pl-0 pr-0 lg:pl-5 lg:pr-6"
                  style={STORY_PAGE_COPY_STYLE}
                >
                  {!(
                    block.body &&
                    block.body.length > 0 &&
                    !useFallbackBody
                  ) && (
                    <h3 className="mb-4 text-left font-light !text-white">
                      {subheading}
                    </h3>
                  )}
                  {block.body && block.body.length > 0 && !useFallbackBody ? (
                    <>
                      <div
                        className="our-story-body max-w-none [&_p]:!text-white [&_span]:!text-white [&_a]:!text-white [&>*]:mt-[29px] [&>*:first-child]:mt-0"
                        style={{
                          fontWeight: 300,
                          fontSize: "1.5rem",
                          lineHeight: "normal",
                          color: "#FFF",
                        }}
                      >
                        <PortableText
                          value={
                            block.body as import("@portabletext/types").PortableTextBlock[]
                          }
                          components={{
                            block: {
                              h2: ({ children }) => (
                                <h2
                                  className="!text-white font-medium"
                                  style={{ fontSize: "1.25rem", fontWeight: 500 }}
                                >
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3
                                  className="!text-white font-medium"
                                  style={{ fontSize: "1.25rem", fontWeight: 500 }}
                                >
                                  {children}
                                </h3>
                              ),
                              h4: ({ children }) => (
                                <h4
                                  className="!text-white font-medium"
                                  style={{ fontSize: "1.25rem", fontWeight: 500 }}
                                >
                                  {children}
                                </h4>
                              ),
                              h5: ({ children }) => (
                                <h5
                                  className="!text-white font-medium"
                                  style={{ fontSize: "1.25rem", fontWeight: 500 }}
                                >
                                  {children}
                                </h5>
                              ),
                            },
                          }}
                        />
                      </div>
                      <>
                        <p
                          className="-ml-[1.0625rem] mt-6"
                          style={{
                            color: "var(--White, #FFF)",
                            fontFamily:
                              "var(--font-mulish), Mulish, sans-serif",
                            fontSize: "1.5rem",
                            fontStyle: "normal",
                            fontWeight: 800,
                            lineHeight: "normal",
                          }}
                        >
                          – Riendeau Family,
                        </p>
                        <p className="mt-1 font-light !text-white">
                          Founder of Hook Point Fisheries
                        </p>
                      </>
                    </>
                  ) : (
                    <div className="[&_p]:!text-white [&_p]:font-light">
                      <p className="!text-white">We are Hook Point.</p>
                      <p className="mb-0 !text-white">&nbsp;</p>
                      <p className="mb-0 !text-white">
                        Our family fishes the pristine waters of Kodiak, Alaska
                        to bring you the highest quality seafood around.
                      </p>
                      <p className="mb-0 !text-white">&nbsp;</p>
                      <p className="mb-0 !text-white">
                        We are proud to be your fisherfolk
                      </p>
                      <p
                        className="-ml-[1.0625rem] mt-6"
                        style={{
                          color: "var(--White, #FFF)",
                          fontFamily: "var(--font-mulish), Mulish, sans-serif",
                          fontSize: "1.5rem",
                          fontStyle: "normal",
                          fontWeight: 800,
                          lineHeight: "normal",
                        }}
                      >
                        – Riendeau Family,
                      </p>
                      <p className="mt-1 font-light !text-white">
                        Founder of Hook Point Fisheries
                      </p>
                    </div>
                  )}
                  {!hideCta && hasCtaFromSanity && (
                    <div className="mt-6 flex w-full justify-center md:justify-start">
                      <a
                        href={ctaHref}
                        className="min-h-[44px] inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity normal-case text-white"
                        style={{
                          fontFamily: "Inter, var(--font-inter), sans-serif",
                          fontSize: "1rem",
                          fontStyle: "normal",
                          fontWeight: 500,
                          lineHeight: "normal",
                          textTransform: "none",
                        }}
                      >
                        {ctaLabel}
                        <img
                          src="/Vector.svg"
                          alt=""
                          aria-hidden
                          className="shrink-0 max-w-full h-auto w-[28px] invert"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {!(block.body && block.body.length > 0 && !useFallbackBody) && (
                  <h3
                    className="mb-4 text-left font-bold"
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontSize: "1.5rem",
                      color: "#171717",
                    }}
                  >
                    {subheading}
                  </h3>
                )}
                {block.body && block.body.length > 0 && !useFallbackBody ? (
                  <div
                    className="our-story-body our-story-body--desktop max-w-none pl-0 pr-0 [&>*]:mt-[29px] [&>*:first-child]:mt-0 lg:pl-5 lg:pr-6"
                    style={BODY_STYLE}
                  >
                    <PortableText
                      value={
                        block.body as import("@portabletext/types").PortableTextBlock[]
                      }
                      components={{
                        block: {
                          h2: ({ children }) => (
                            <h2 style={OUR_STORY_SUBHEADING_STYLE}>
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 style={OUR_STORY_SUBHEADING_STYLE}>
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 style={OUR_STORY_SUBHEADING_STYLE}>
                              {children}
                            </h4>
                          ),
                          h5: ({ children }) => (
                            <h5 style={OUR_STORY_SUBHEADING_STYLE}>
                              {children}
                            </h5>
                          ),
                        },
                      }}
                    />
                  </div>
                ) : (
                  HOOK_POINT_BODY
                )}
                {!hideCta && hasCtaFromSanity && (
                  <div className="mt-[29px] flex w-full justify-center md:justify-start lg:pl-5">
                    <a
                      href={ctaHref}
                      className="min-h-[44px] inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity normal-case"
                      style={{
                        color: "#498CCB",
                        fontFamily: "Inter, var(--font-inter), sans-serif",
                        fontSize: "1rem",
                        fontStyle: "normal",
                        fontWeight: 500,
                        lineHeight: "normal",
                        textTransform: "none",
                      }}
                    >
                      {ctaLabel}
                      <img
                        src="/Vector.svg"
                        alt=""
                        aria-hidden
                        className="shrink-0 max-w-full h-auto w-[28px]"
                      />
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {isStoryPage && !hideWave ? (
        <div className="-mt-8 w-full shrink-0 overflow-visible pb-8 bg-[#D4F2FF] md:-mt-0">
          <div className="wave-full-bleed shrink-0 overflow-visible">
            <WaveDivider
              navySrc="/VectorWavyNavy.svg"
              wrapperClassName="-mt-px [transform:scaleX(-1)] bg-[#D4F2FF]"
              navyOutline="bottom"
            />
          </div>
        </div>
      ) : !isStoryPage && !hideWave ? (
        <div className="-mt-8 mt-auto w-full shrink-0 overflow-visible md:-mt-0">
          <div className="wave-full-bleed mt-auto shrink-0">
            <WaveDivider
              navySrc="/VectorWavyNavyOurStory.svg"
              navyOutline="top"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
