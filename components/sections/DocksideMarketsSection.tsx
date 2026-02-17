import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type MarketItem = { label?: string; logo?: { asset?: { _ref?: string } }; url?: string };

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
    <section id="markets" className="border-y border-black/5 bg-white py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-center text-sm text-slate-600">{description}</p>
        )}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.length > 0
            ? items.map((item, idx) => {
                const img = urlFor(item.logo);
                const content = img ? (
                  <img
                    src={img.url()}
                    alt={item.label ?? ""}
                    className="h-12 w-auto object-contain"
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
                    className="flex items-center justify-center rounded-xl border border-black/5 bg-slate-50 p-5 hover:bg-slate-100 transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={idx}
                    className="flex items-center justify-center rounded-xl border border-black/5 bg-slate-50 p-5"
                  >
                    {content}
                  </div>
                );
              })
            : ["Lincoln Park", "Uptown", "Lakeview", "South Loop", "Logan Square", "Wicker Park"].map(
                (name) => (
                  <div
                    key={name}
                    className="flex items-center justify-center rounded-xl border border-black/5 bg-slate-50 p-5 text-xs font-semibold text-slate-700"
                  >
                    {name}
                  </div>
                )
              )}
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
  );
}
