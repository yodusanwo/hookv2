import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { urlFor } from "@/lib/sanityImage";
import { safeHref } from "@/lib/urlValidation";
import { CalendarEventsListWithFilter } from "./CalendarEventsListWithFilter";

// Must match WAVE_ASPECT_RATIO in RecipesSection.tsx
const WAVE_ASPECT_RATIO = 0.125;

type Event = {
  date?: string;
  time?: string;
  eventType?: string;
  address?: string;
  /** Month 1–12 for filtering (from Google Sheet). */
  eventMonth?: number;
  /** @deprecated use eventType */
  name?: string;
  /** @deprecated use address */
  location?: string;
};

type UpcomingEventsBlock = {
  backgroundColor?: string;
  title?: string;
  description?: string;
  images?: { asset?: { _ref?: string } }[];
  events?: Event[];
  /** When set (e.g. 3 on home), only show first N events. When undefined, show all (e.g. on /calendar). */
  eventsLimit?: number;
  showAllUrl?: string;
};

export function UpcomingEventsSection({
  block,
  pageSlug,
}: {
  block: UpcomingEventsBlock;
  /** When "calendar", show month filter below the event list (only on /calendar page). */
  pageSlug?: string;
}) {
  const title = block.title ?? "UPCOMING EVENTS";
  const description = block.description ?? "";
  const images = block.images ?? [];
  const allEvents = block.events ?? [];
  const events = allEvents.slice(0, block.eventsLimit ?? allEvents.length);
  const showAllUrl = block.showAllUrl;
  const bgColor = block.backgroundColor ?? "#f1f5f9";
  const isCalendarPage = pageSlug === "calendar";

  return (
    <section
      id="events"
      className="pb-14"
      style={{
        backgroundColor: bgColor,
        // Matches WAVE_HALF from RecipesSection — the other 80px of the wave
        // that hangs into this section. Extra 24px gives breathing room.
        paddingTop: "104px",
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
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
                  className="aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-lg"
                  style={{ backgroundColor: bgColor }}
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

        {isCalendarPage ? (
          <CalendarEventsListWithFilter
            events={events}
            showAllUrl={showAllUrl}
            bgColor={bgColor}
          />
        ) : (
          <>
            {events.length > 0 ? (
              <div className="mt-10 w-full max-w-[1200px] mx-auto">
                <div className="overflow-hidden" style={{ backgroundColor: bgColor }}>
                  {events.map((e, idx) => (
                    <div
                      key={idx}
                      className={idx < events.length - 1 ? "border-b" : ""}
                      style={
                        idx < events.length - 1
                          ? {
                              borderBottomWidth: "1px",
                              borderBottomColor: "#D1D5DB",
                            }
                          : undefined
                      }
                    >
                      <div
                        className="grid grid-cols-1 gap-x-6 gap-y-1 px-4 py-4 sm:grid-cols-4 sm:py-3 sm:items-center sm:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)_minmax(0,2.5fr)_minmax(0,2.5fr)]"
                        style={{
                          color: "#1E1E1E",
                          fontFamily: "var(--font-inter), Inter, sans-serif",
                          fontSize: "16px",
                          fontStyle: "normal",
                          fontWeight: 400,
                          lineHeight: "normal",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src="/CalendarIcon.svg"
                            alt=""
                            aria-hidden
                            width={16.897}
                            height={19.733}
                            style={{ flexShrink: 0 }}
                          />
                          <span>{e.date ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src="/timeicon.svg"
                            alt=""
                            aria-hidden
                            width={19}
                            height={19}
                            style={{ flexShrink: 0 }}
                          />
                          <span>{e.time ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src="/Locationicon.svg"
                            alt=""
                            aria-hidden
                            width={19}
                            height={19}
                            style={{ flexShrink: 0 }}
                          />
                          <span>{e.eventType ?? e.name ?? "—"}</span>
                        </div>
                        <div>
                          {(() => {
                            const raw = (e.address ?? e.location ?? "").trim() || "—";
                            if (raw === "—") return raw;
                            const firstComma = raw.indexOf(",");
                            if (firstComma === -1) return raw;
                            const line1 = raw.slice(0, firstComma).trim();
                            const line2 = raw.slice(firstComma + 1).trim();
                            return (
                              <>
                                {line1}
                                <br />
                                {line2}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-10 text-center text-slate-600">
                No upcoming events at the moment. Check back soon.
              </p>
            )}

            {showAllUrl && (
              <Link
                href={safeHref(showAllUrl) ?? "#"}
                className="mt-8 ml-4 inline-flex items-center gap-1.5 font-medium hover:opacity-90"
                style={{
                  color: "#498CCB",
                  fontFamily: "Inter, var(--font-inter), sans-serif",
                  fontSize: "16px",
                  lineHeight: "normal",
                }}
              >
                Show all events
                <img
                  src="/Vector.svg"
                  alt=""
                  aria-hidden
                  width={28.333}
                  height={12.307}
                  className="shrink-0 max-w-full h-auto"
                />
              </Link>
            )}
          </>
        )}
      </div>
    </section>
  );
}
