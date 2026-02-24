/**
 * "Why Wild Matters" section: title, intro, large image left, and 3 (or more) points with icons on the right.
 * Light blue background, two-column layout.
 */
import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlFor } from "@/lib/sanityImage";

type WhyWildMattersPoint = {
  title?: string;
  description?: string;
  icon?: { _ref?: string; asset?: { _ref?: string } };
};

type WhyWildMattersBlock = {
  title?: string;
  description?: string;
  image?: { _ref?: string; asset?: { _ref?: string } };
  points?: WhyWildMattersPoint[];
};

const DEFAULT_TITLE = "WHY WILD MATTERS";
const DEFAULT_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

const DEFAULT_POINTS: WhyWildMattersPoint[] = [
  {
    title: "Wild Salmon Thrive Naturally",
    description:
      "Wild salmon grow in open oceans and rivers, eating a natural diet that leads to cleaner flavor and stronger nutritional value.",
  },
  {
    title: "Farmed Salmon Depend on Controlled Systems",
    description:
      "Farmed salmon live in crowded pens and rely on formulated feed, which can affect their health, color, and overall quality.",
  },
  {
    title: "Choosing Wild Supports Real Fishing Communities",
    description:
      "Opting for wild-caught salmon sustains small Alaskan fisheries and the coastal families who rely on responsible harvesting.",
  },
];

export function WhyWildMattersSection({ block }: { block: WhyWildMattersBlock }) {
  const title = block.title ?? DEFAULT_TITLE;
  const description = block.description ?? DEFAULT_DESCRIPTION;
  const points = block.points?.length ? block.points : DEFAULT_POINTS;
  let imageUrl: string | null = null;
  try {
    const img = urlFor(block.image);
    imageUrl = img ? img.url() : null;
  } catch {
    imageUrl = null;
  }

  return (
    <section
      className="relative z-10 overflow-visible pt-24 pb-14"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <SectionHeading
          title={title}
          description={description}
          variant="display"
          theme="light"
          descriptionAsLead={false}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          {/* Left: image */}
          <div className="overflow-hidden rounded-xl">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "4/3", maxHeight: 420 }}
                loading="lazy"
              />
            ) : (
              <div
                className="bg-slate-300"
                style={{ aspectRatio: "4/3", maxHeight: 420 }}
              />
            )}
          </div>

          {/* Right: points */}
          <div className="flex flex-col gap-8">
            {points.map((point, idx) => {
              let iconUrl: string | null = null;
              try {
                const img = urlFor(point.icon);
                iconUrl = img ? img.url() : null;
              } catch {
                iconUrl = null;
              }
              return (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        aria-hidden
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <div
                        className="h-12 w-12 rounded bg-slate-200"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900">
                      {point.title || "Point"}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {point.description || ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
