import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { PortableText } from "next-sanity";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type OurStoryBlock = {
  title?: string;
  body?: unknown[];
  image?: { asset?: { _ref?: string } };
  subheading?: string;
  cta?: { label?: string; href?: string };
};

const BODY_STYLE = {
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontSize: "16px",
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "150%",
  color: "#1E1E1E",
} as const;

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
        backgroundColor: isStoryPage ? "#171730" : "var(--brand-light-blue-bg)",
      }}
    >
      <div
        className="mx-auto w-full px-4 pb-12 pt-10"
        style={{ maxWidth: 1440 }}
      >
        {!hideTitle && (
          <SectionHeading
            title={title}
            variant="display"
            theme={isStoryPage ? "dark" : "light"}
            titleFontFamily="var(--font-zamenhof-inverse), var(--font-inter), Inter, sans-serif"
          />
        )}
        <div className={`grid gap-8 lg:grid-cols-2 lg:items-stretch ${!hideTitle ? "mt-10" : ""}`}>
          <div className="overflow-hidden rounded-xl bg-slate-200">
            {img ? (
              <img
                src={img.url()}
                alt={hideTitle ? (block.title ?? "Our story") : title}
                className="h-[300px] w-full max-w-full object-cover md:h-[420px]"
                style={{ objectPosition: "center top" }}
                loading="lazy"
              />
            ) : (
              <div className="h-[300px] w-full md:h-[420px]" />
            )}
          </div>
          <div
            className="flex max-w-xl flex-col justify-center rounded-xl px-6 pb-6 pt-0"
            style={{
              backgroundColor: isStoryPage ? "transparent" : "var(--brand-light-blue-bg)",
            }}
          >
            {isStoryPage ? (
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src="/quote.png"
                  alt=""
                  aria-hidden
                  className="h-16 w-10 shrink-0 object-contain sm:h-20 sm:w-12 lg:h-24 lg:w-14"
                />
                <div className="min-w-0 flex-1">
                  <h3
                    className="mb-4 text-left font-bold"
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontSize: "24px",
                      color: "#fff",
                    }}
                  >
                    {subheading}
                  </h3>
                  {block.body && block.body.length > 0 && !useFallbackBody ? (
                    <>
                      <div
                        className={`our-story-body max-w-none [&_p]:mt-4 first:[&_p]:mt-0 [&_p]:!text-white [&_span]:!text-white [&_a]:!text-white`}
                        style={{ ...BODY_STYLE, color: "#ffffff" }}
                      >
                        <PortableText
                          value={
                            block.body as import("@portabletext/types").PortableTextBlock[]
                          }
                        />
                      </div>
                      <>
                        <p
                          className="mt-6 font-extrabold text-2xl !text-white"
                          style={{ fontFamily: "var(--font-inter), Inter, sans-serif", color: "#ffffff" }}
                        >
                          Riendeau Family,
                        </p>
                        <p
                          className="mt-1 font-light text-2xl !text-white"
                          style={{ fontFamily: "var(--font-inter), Inter, sans-serif", color: "#ffffff" }}
                        >
                          Founder of Hook Point Fisheries
                        </p>
                      </>
                    </>
                  ) : (
                    <div className="[&_p]:!text-white" style={{ ...BODY_STYLE, color: "#ffffff" }}>
                      <p style={{ color: "#ffffff" }}>We are Hook Point.</p>
                      <p style={{ color: "#ffffff" }} className="mb-0">&nbsp;</p>
                      <p style={{ color: "#ffffff" }} className="mb-0">
                        Our family fishes the pristine waters of Kodiak, Alaska to bring you the highest quality seafood around.
                      </p>
                      <p style={{ color: "#ffffff" }} className="mb-0">&nbsp;</p>
                      <p style={{ color: "#ffffff" }} className="mb-0">We are proud to be your fisherfolk</p>
                      <p className="mt-6 font-extrabold text-2xl" style={{ color: "#ffffff", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
                        Riendeau Family,
                      </p>
                      <p className="mt-1 font-light text-2xl" style={{ color: "#ffffff", fontFamily: "var(--font-inter), Inter, sans-serif" }}>
                        Founder of Hook Point Fisheries
                      </p>
                    </div>
                  )}
                  {!hideCta && hasCtaFromSanity && (
                    <div className="mt-6">
                      <a
                        href={ctaHref}
                        className="inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity normal-case text-white"
                        style={{
                          fontFamily: "Inter, var(--font-inter), sans-serif",
                          fontSize: "16px",
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
                <h3
                  className="mb-4 text-left font-bold"
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "24px",
                    color: "#171717",
                  }}
                >
                  {subheading}
                </h3>
                {block.body && block.body.length > 0 && !useFallbackBody ? (
                  <div
                    className="our-story-body prose prose-slate max-w-none [&_p]:mt-4 first:[&_p]:mt-0"
                    style={BODY_STYLE}
                  >
                    <PortableText
                      value={
                        block.body as import("@portabletext/types").PortableTextBlock[]
                      }
                    />
                  </div>
                ) : (
                  HOOK_POINT_BODY
                )}
                {!hideCta && hasCtaFromSanity && (
                  <div className="mt-6">
                    <a
                      href={ctaHref}
                      className="inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity normal-case"
                      style={{
                        color: "#498CCB",
                        fontFamily: "Inter, var(--font-inter), sans-serif",
                        fontSize: "16px",
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

      {!hideWave && (
        <div className="mt-auto w-full shrink-0 overflow-visible">
          <div className="wave-full-bleed mt-auto shrink-0">
            <WaveDivider
              navySrc="/VectorWavyNavyOurStory.svg"
              navyOutline="top"
            />
          </div>
        </div>
      )}
    </section>
  );
}
