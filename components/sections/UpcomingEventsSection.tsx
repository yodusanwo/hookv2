import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";

type Event = {
  date?: string;
  time?: string;
  eventType?: string;
  address?: string;
  /** @deprecated use eventType */
  name?: string;
  /** @deprecated use address */
  location?: string;
};

type UpcomingEventsBlock = {
  title?: string;
  description?: string;
  images?: { asset?: { _ref?: string } }[];
  events?: Event[];
  showAllUrl?: string;
};

export function UpcomingEventsSection({ block }: { block: UpcomingEventsBlock }) {
  const title = block.title ?? "UPCOMING EVENTS";
  const description = block.description ?? "";
  const images = block.images ?? [];
  const events = block.events ?? [];
  const showAllUrl = block.showAllUrl;

  return (
    <section id="events" className="bg-slate-100 py-14">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeading
          title={title}
          description={description || undefined}
          variant="display"
          theme="light"
        />

        {images.length > 0 && (
          <div className="mt-10 flex justify-center gap-6">
            {images.slice(0, 2).map((imgRef, idx) => {
              const img = urlFor(imgRef);
              if (!img) return null;
              return (
                <div
                  key={idx}
                  className="aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-lg bg-slate-100"
                >
                  <img
                    src={img.url()}
                    alt=""
                    className="h-full w-full max-w-full object-cover"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        )}

        {events.length > 0 ? (
          <div className="mt-10 max-w-[962px] mx-auto">
            <div className="overflow-hidden bg-slate-100">
              {events.map((e, idx) => (
                <div
                  key={idx}
                  className={idx < events.length - 1 ? "border-b" : ""}
                  style={idx < events.length - 1 ? { borderBottomWidth: "1px", borderBottomColor: "#D1D5DB" } : undefined}
                >
                  <div className="grid grid-cols-1 gap-x-6 gap-y-1 px-4 py-4 text-slate-800 sm:grid-cols-4 sm:py-3">
                    <div className="font-medium">{e.date ?? "—"}</div>
                    <div>{e.time ?? "—"}</div>
                    <div>{e.eventType ?? e.name ?? "—"}</div>
                    <div className="text-slate-600">{e.address ?? e.location ?? "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-10 text-center text-slate-600">No upcoming events at the moment. Check back soon.</p>
        )}

        {showAllUrl && (
          <Link
            href={safeHref(showAllUrl) ?? "#"}
            className="mt-8 inline-flex items-center gap-1.5 font-medium hover:opacity-90"
            style={{
              color: "#498CCB",
              fontFamily: "Inter, var(--font-inter), sans-serif",
              fontSize: "16px",
              lineHeight: "normal",
            }}
          >
            Show all events
            <img src="/Vector.svg" alt="" aria-hidden width={28.333} height={12.307} className="shrink-0 max-w-full h-auto" />
          </Link>
        )}
      </div>
    </section>
  );
}
