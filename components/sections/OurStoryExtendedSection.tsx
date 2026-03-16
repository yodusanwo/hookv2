import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { PortableText } from "next-sanity";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

const SECTION_TOP_PADDING_PX = 56;

type OurStoryExtendedBlock = {
  backgroundColor?: string;
  title?: string;
  introText?: string;
  body?: unknown[];
  image?: { asset?: { _ref?: string } };
  subheading?: string;
  cta?: { label?: string; href?: string };
};

const TEXT_COLOR = "#1E1E1E";

const COPY_STYLE = {
  color: TEXT_COLOR,
  fontFamily: "var(--font-mulish), Mulish, sans-serif",
  fontSize: "24px",
  fontStyle: "normal" as const,
  fontWeight: 300,
  lineHeight: "normal",
};

const FALLBACK_BODY = (
  <>
    <p className="!text-[#1E1E1E]">We are Hook Point.</p>
    <p className="mb-0 !text-[#1E1E1E]">&nbsp;</p>
    <p className="mb-0 !text-[#1E1E1E]">
      Our family fishes the pristine waters of Kodiak, Alaska to bring you the
      highest quality seafood around.
    </p>
    <p className="mb-0 !text-[#1E1E1E]">&nbsp;</p>
    <p className="mb-0 !text-[#1E1E1E]">We are proud to be your fisherfolk</p>
  </>
);

function isLoremIpsum(body: unknown[] | undefined): boolean {
  if (!body?.length) return false;
  const text = JSON.stringify(body).toLowerCase();
  return (
    text.includes("lorem ipsum") || text.includes("consectetur adipiscing")
  );
}

export function OurStoryExtendedSection({
  block,
  showBottomWave = false,
}: {
  block: OurStoryExtendedBlock;
  /** When true, show the wave at the bottom of this section (e.g. /wild page only). */
  showBottomWave?: boolean;
}) {
  const subheading = block.subheading ?? "Who We Are";
  const img = urlFor(block.image);
  const rawCtaLabel = block.cta?.label ?? "Meet your fishermen";
  const ctaLabel =
    rawCtaLabel.length > 0
      ? rawCtaLabel.charAt(0).toUpperCase() + rawCtaLabel.slice(1).toLowerCase()
      : "Meet your fishermen";
  const rawHref = block.cta?.href?.trim();
  const ctaHref = rawHref ? safeHref(rawHref) : "#learn";

  const hasCtaFromSanity =
    !!block.cta && (!!block.cta.label?.trim() || !!block.cta.href?.trim());
  const useFallbackBody = !block.body?.length || isLoremIpsum(block.body);

  return (
    <section
      id="our-story-extended"
      className="relative z-10 mx-auto flex min-w-0 flex-col justify-start overflow-visible pb-0"
      style={{
        backgroundColor: block.backgroundColor ?? "#D4F2FF",
        width: "100%",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 md:px-4 pt-12 pb-12 md:pt-[56px] md:pb-12 md:pl-[2.25rem]">
        {(block.title ?? "").trim() && (
          <SectionHeading
            title={block.title!.trim()}
            variant="display"
            theme="light"
            titleColor="#1E1E1E"
            titleFontFamily="var(--font-zamenhof-inverse), var(--font-inter), Inter, sans-serif"
          />
        )}
        {(block.introText ?? "").trim() && (
          <p
            className="text-center max-w-[789px] mx-auto mt-6 whitespace-pre-line"
            style={{
              color: "#1E1E1E",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "20px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "150%",
            }}
          >
            {block.introText!.trim()}
          </p>
        )}
        <div
          className={`grid gap-8 lg:grid-cols-[440.8px_1fr] lg:items-start ${(block.title ?? "").trim() || (block.introText ?? "").trim() ? "mt-10 pt-[2.5rem]" : "pt-[2.5rem]"}`}
        >
          <div
            className="min-w-0 w-full overflow-hidden shrink-0 aspect-square rounded-[10px] md:min-w-[440.8px] md:w-[440.8px]"
            style={{ background: "lightgray" }}
          >
            {img ? (
              <img
                src={img.url()}
                alt={block.title ?? "Our story"}
                className="w-full h-full object-cover"
                style={{ objectPosition: "50% 50%" }}
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: "lightgray" }}
              />
            )}
          </div>
          <div
            className="min-w-0 flex flex-col justify-start rounded-xl px-6 pb-6 pt-0 lg:max-w-none"
            style={{ backgroundColor: "transparent" }}
          >
            <div className="min-w-0 max-w-full lg:w-[432px] lg:max-w-[432px]" style={COPY_STYLE}>
              <h3
                className="mb-4 text-left whitespace-pre-line"
                style={{
                  color: "#1E1E1E",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: "24px",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: "150%",
                }}
              >
                {subheading}
              </h3>
              {block.body && block.body.length > 0 && !useFallbackBody ? (
                <>
                  <div
                    className="our-story-body text-2xl font-medium leading-[150%] lg:text-[20px] lg:font-normal [&_p]:mt-4 [&_p]:whitespace-pre-line first:[&_p]:mt-0 [&_p]:!text-[#1E1E1E] [&_span]:!text-[#1E1E1E] [&_a]:!text-[#1E1E1E]"
                    style={{
                      color: "#1E1E1E",
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontStyle: "normal",
                      lineHeight: "150%",
                    }}
                  >
                    <PortableText
                      value={
                        block.body as import("@portabletext/types").PortableTextBlock[]
                      }
                    />
                  </div>
                </>
              ) : (
                <div
                  className="[&_p]:!text-[#1E1E1E] text-2xl font-medium leading-[150%] lg:text-[20px] lg:font-normal"
                  style={{
                    color: "#1E1E1E",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontStyle: "normal",
                    lineHeight: "150%",
                  }}
                >
                  {FALLBACK_BODY}
                </div>
              )}
              {hasCtaFromSanity && (
                <div className="mt-6 flex w-full justify-center md:justify-start">
                  <a
                    href={ctaHref}
                    className="inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity normal-case !text-[#1E1E1E]"
                    style={{
                      fontFamily: "Inter, var(--font-inter), sans-serif",
                      fontSize: "16px",
                      fontStyle: "normal",
                      fontWeight: 500,
                      lineHeight: "normal",
                      textTransform: "none",
                      color: TEXT_COLOR,
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
            </div>
          </div>
        </div>
      </div>
      {showBottomWave && (
        <div
          className="relative z-30 top-[60px] -mt-12 -mb-2 w-full shrink-0 md:top-[100px] md:-mt-8"
          style={{ transform: "scaleX(1.10) rotate(-5deg) translateZ(0)" }}
        >
          <WaveDivider
            navySrc="/VectorWavyNavyOurStory.svg"
            wrapperClassName="mt-3 -mb-px [background-color:transparent]"
            navyOutline="top"
          />
          <WaveDivider
            navySrc="/VectorWavyNavy.svg"
            wrapperClassName="-mt-px [background-color:transparent]"
            navyOutline="bottom"
          />
        </div>
      )}
    </section>
  );
}
