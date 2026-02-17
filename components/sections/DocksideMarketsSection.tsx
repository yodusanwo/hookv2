import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type MarketItem = {
  label?: string;
  logo?: { asset?: { _ref?: string } };
  url?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoAspectRatio?: string;
};

type DocksideMarketsBlock = {
  title?: string;
  description?: string;
  items?: MarketItem[];
};

export function DocksideMarketsSection({ block }: { block: DocksideMarketsBlock }) {
  const title = block.title ?? "Find us at these Chicagoland Farmers Markets";
  const description = block.description ?? "";
  const items = block.items ?? [];

  return (
    <section id="markets" className="border-y border-black/5 bg-[#FAFAFC] py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.length > 0
            ? items.map((item, idx) => {
                const img = urlFor(item.logo);
                const logoW = item.logoWidth ?? 115;
                const logoH = item.logoHeight ?? 115;
                const logoAspect = item.logoAspectRatio ?? "1/1";
                const content = img ? (
                  <div
                    role="img"
                    aria-label={item.label ?? ""}
                    className="shrink-0 rounded-none"
                    style={{
                      width: logoW,
                      height: logoH,
                      aspectRatio: logoAspect,
                      background: `url(${img.url()}) #FAFAFC 50% / cover no-repeat`,
                    }}
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                );
                const safeUrl = safeHref(item.url);
                return safeUrl !== "#" ? (
                  <a
                    key={idx}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-[#FAFAFC] p-5 hover:opacity-80 transition-opacity"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={idx}
                    className="flex items-center justify-center bg-[#FAFAFC] p-5"
                  >
                    {content}
                  </div>
                );
              })
            : ["Lincoln Park", "Uptown", "Lakeview", "South Loop", "Logan Square", "Wicker Park"].map(
                (name) => (
                  <div
                    key={name}
                    className="flex items-center justify-center bg-[#FAFAFC] p-5 text-xs font-semibold text-slate-700"
                  >
                    {name}
                  </div>
                )
              )}
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href="#contact"
            className="btn-primary"
          >
            Pick Fresh Farmers Markets and Event Calendar
          </a>
        </div>
      </div>
    </section>
  );
}
