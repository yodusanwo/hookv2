"use client";

import * as React from "react";
import Link from "next/link";
import { UpcomingEventsMonthFilter } from "./UpcomingEventsMonthFilter";
import { safeHref } from "@/lib/urlValidation";

type Event = {
  date?: string;
  time?: string;
  eventType?: string;
  address?: string;
  name?: string;
  location?: string;
  eventMonth?: number;
  eventYear?: number;
};

const CHICAGO: Intl.DateTimeFormatOptions = {
  timeZone: "America/Chicago",
  month: "numeric",
};

/** When a month filter returns more than this many rows, the list uses a fixed viewport (~5 rows) with inner scroll. */
const FARMERS_MARKET_LIST_SCROLL_THRESHOLD = 5;

/**
 * Scroll region max height: ~5 rows on small screens; restore generous cap on md+ (matches pre-change desktop UX).
 * Threshold still gates when inner scroll applies (>5 events).
 */
const FARMERS_MARKET_LIST_SCROLL_REGION_CLASS =
  "max-h-[min(31.25rem,70vh)] md:max-h-[min(70vh,960px)]";

function isValidMonth(n: number): boolean {
  return Number.isFinite(n) && n >= 1 && n <= 12;
}

/** Month 1–12 for “now” in America/Chicago (matches lib/googleSheets.ts MARKET_TIMEZONE). Never uses the browser local timezone. */
function getCurrentMonthChicago(): number {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", CHICAGO);

  try {
    const parts = fmt.formatToParts(now);
    const monthPart = parts.find((p) => p.type === "month");
    const n = monthPart ? parseInt(monthPart.value, 10) : NaN;
    if (isValidMonth(n)) return n;
  } catch {
    /* try .format() */
  }

  try {
    const s = fmt.format(now).trim();
    const n = parseInt(s, 10);
    if (isValidMonth(n)) return n;
  } catch {
    /* last resort below */
  }

  // Extremely rare: no Chicago month from Intl — avoid local TZ; default to 1.
  return 1;
}

export function CalendarEventsListWithFilter({
  events,
  showAllUrl,
  bgColor,
}: {
  events: Event[];
  showAllUrl?: string | null;
  bgColor: string;
}) {
  /** Lazy initializer runs once on mount; value is always 1–12 (see getCurrentMonthChicago). */
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(() =>
    getCurrentMonthChicago(),
  );

  /** Run after React commits and the browser paints — fixes mobile Safari where immediate scrollIntoView from a click often does nothing. */
  const scrollEventsSectionIntoView = React.useCallback(() => {
    const run = () => {
      const el = document.getElementById("calendar");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, []);

  const handleMonthChange = React.useCallback(
    (month: number | null) => {
      setSelectedMonth(month);
      scrollEventsSectionIntoView();
    },
    [scrollEventsSectionIntoView]
  );

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (selectedMonth != null && e.eventMonth !== selectedMonth) return false;
      return true;
    });
  }, [events, selectedMonth]);

  if (events.length === 0) {
    return (
      <>
        <div className="mt-10 w-full flex justify-center">
          <UpcomingEventsMonthFilter
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
        </div>
        <p className="mt-8 text-center text-slate-600">
          No upcoming events at the moment. Check back soon.
        </p>
        {showAllUrl && (
          <div className="mt-8 flex w-full justify-center md:justify-start md:ml-4">
          <Link
            href={safeHref(showAllUrl) ?? "#"}
            className="inline-flex items-center gap-1.5 font-medium hover:opacity-90"
            style={{
              color: "#498CCB",
              fontFamily: "Inter, var(--font-inter), sans-serif",
              fontSize: "1rem",
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
          </div>
        )}
      </>
    );
  }

  const listScrolls =
    filteredEvents.length > FARMERS_MARKET_LIST_SCROLL_THRESHOLD;

  const listScrollRef = React.useRef<HTMLDivElement>(null);
  const [listHasOverflow, setListHasOverflow] = React.useState(false);
  const [listAtBottom, setListAtBottom] = React.useState(true);

  const updateListScrollAffordance = React.useCallback(() => {
    const el = listScrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflow = scrollHeight > clientHeight + 2;
    setListHasOverflow(overflow);
    const atBottom =
      !overflow || scrollTop + clientHeight >= scrollHeight - 2;
    setListAtBottom(atBottom);
  }, []);

  React.useLayoutEffect(() => {
    updateListScrollAffordance();
  }, [filteredEvents, listScrolls, updateListScrollAffordance]);

  React.useEffect(() => {
    const el = listScrollRef.current;
    if (!el || !listScrolls) return;
    const ro = new ResizeObserver(() => updateListScrollAffordance());
    ro.observe(el);
    return () => ro.disconnect();
  }, [listScrolls, updateListScrollAffordance]);

  React.useEffect(() => {
    const el = listScrollRef.current;
    if (el && listScrolls) {
      el.scrollTop = 0;
      requestAnimationFrame(updateListScrollAffordance);
    }
  }, [selectedMonth, filteredEvents.length, listScrolls, updateListScrollAffordance]);

  const showScrollMoreHint =
    listScrolls && listHasOverflow && !listAtBottom;

  const eventRows = filteredEvents.map((e, idx) => (
    <div
      key={idx}
      className={idx < filteredEvents.length - 1 ? "border-b" : ""}
      style={
        idx < filteredEvents.length - 1
          ? {
              borderBottomWidth: "1px",
              borderBottomColor: "#D1D5DB",
            }
          : undefined
      }
    >
      <div
        className="grid grid-cols-1 gap-x-6 gap-y-1 px-6 md:px-4 py-4 sm:grid-cols-4 sm:py-3 sm:items-center sm:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)_minmax(0,2.5fr)_minmax(0,2.5fr)]"
        style={{
          color: "#1E1E1E",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: "1rem",
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
  ));

  return (
    <>
      <div className="mt-10 w-full flex justify-center">
        <UpcomingEventsMonthFilter
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      </div>

      {filteredEvents.length > 0 ? (
        <div className="mt-8 w-full max-w-[1200px] mx-auto">
          {listScrolls ? (
            <div className="relative">
              <div
                ref={listScrollRef}
                onScroll={updateListScrollAffordance}
                className={`overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable] ${FARMERS_MARKET_LIST_SCROLL_REGION_CLASS}`}
                style={{ backgroundColor: bgColor }}
                role="region"
                aria-label="Farmers market events for the selected month"
              >
                {eventRows}
              </div>
              {showScrollMoreHint ? (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20"
                    style={{
                      background: `linear-gradient(to top, ${bgColor} 28%, transparent 100%)`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute bottom-2 left-0 right-0 z-[2] flex justify-center px-4"
                    aria-hidden
                  >
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:text-sm"
                      style={{
                        fontFamily: "var(--font-inter), Inter, sans-serif",
                      }}
                    >
                      Scroll for more markets
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-slate-500"
                        aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div className="overflow-hidden" style={{ backgroundColor: bgColor }}>
              {eventRows}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-8 text-center text-slate-600">
          No events in this month. Try another filter.
        </p>
      )}

      {showAllUrl && (
        <div className="mt-8 flex w-full justify-center md:justify-start md:ml-4">
          <Link
            href={safeHref(showAllUrl) ?? "#"}
            className="inline-flex items-center gap-1.5 font-medium hover:opacity-90"
            style={{
              color: "#498CCB",
              fontFamily: "Inter, var(--font-inter), sans-serif",
              fontSize: "1rem",
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
        </div>
      )}
    </>
  );
}
