import { SectionHeading } from "@/components/ui/SectionHeading";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { urlForSizedImage } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type CoopItem = {
  label?: string;
  logo?: { asset?: { _ref?: string } };
  url?: string;
  bordered?: boolean;
};

type LocalFoodsCoopsBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  body?: unknown[];
  image?: { asset?: { _ref?: string } };
  logoButtons?: CoopItem[];
};

export function LocalFoodsCoopsSection({
  block,
  hideWave = false,
  bottomPaddingClass,
}: {
  block: LocalFoodsCoopsBlock;
  /** When true, the wave below the section is hidden (e.g. on /story page only). */
  hideWave?: boolean;
  /** Optional Tailwind bottom padding class (e.g. pb-10) for page-specific spacing (e.g. /story). */
  bottomPaddingClass?: string;
}) {
  const title = block.title ?? "LOCAL FOODS CO-OPS";
  const description = block.description ?? "";
  const items = block.logoButtons ?? [];

  return (
    <section
      className={`relative z-20 flex min-h-0 flex-col justify-center pt-12 pb-12 md:pt-[3.75rem] ${bottomPaddingClass ? bottomPaddingClass : "md:pb-0"}`.trim()}
      style={{ backgroundColor: block.backgroundColor ?? "#FAFAFC" }}
    >
      <div
        className="mx-auto w-full px-4 text-center"
        style={{ maxWidth: "90rem" }}
      >
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
          titleColor="#111827"
          descriptionColor="#1E1E1E"
        />
        <div className="mt-2 flex w-full min-w-0 flex-row flex-nowrap items-center justify-center gap-2 overflow-x-auto overflow-y-hidden py-2 [scrollbar-gutter:stable] sm:gap-3 md:gap-4">
          {items.map((item, idx) => {
            const logoImg = item.logo ? urlForSizedImage(item.logo, 480) : null;
            const safeUrl = safeHref(item.url);
            const showBorder = item.bordered ?? false;
            /** `inline-flex shrink-0` keeps logos in one horizontal row; `w-full` on children was forcing a vertical stack under `md:flex`. */
            const wrapperClass = `inline-flex shrink-0 min-w-0 items-center justify-center gap-2 bg-transparent px-1 py-1 sm:px-2 sm:py-1.5 ${showBorder ? "rounded border border-slate-300/80" : ""}`;

            const content = logoImg ? (
              <div className="flex h-[4.392rem] shrink-0 max-w-[16.6375rem] items-center justify-center sm:h-[4.5375rem] sm:max-w-[21.175rem] md:h-[4.84rem] md:max-w-[25.7125rem]">
                <img
                  src={logoImg}
                  alt={item.label ?? ""}
                  className="max-h-full max-w-full h-auto w-auto object-contain object-center"
                  loading="lazy"
                />
              </div>
            ) : (
              <>
                <MapPinIcon className="h-6 w-6 shrink-0 text-emerald-600" />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#1E1E1E" }}
                >
                  {item.label ?? "Co-op"}
                </span>
              </>
            );

            if (safeUrl && safeUrl !== "#") {
              return (
                <a
                  key={idx}
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${wrapperClass} hover:opacity-90 transition-opacity`}
                >
                  {content}
                </a>
              );
            }
            return (
              <div key={idx} className={wrapperClass}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
      {!hideWave && (
        <div
          className="relative top-[3.75rem] -mt-12 pb-0 -mb-2.5 w-full shrink-0 md:top-[6.25rem] md:-mt-0"
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
