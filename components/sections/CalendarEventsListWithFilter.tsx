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

/** Month 1–12 for “now” in America/Chicago (matches lib/googleSheets.ts MARKET_TIMEZONE). */
function getCurrentMonthChicago(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "numeric",
  }).formatToParts(new Date());
  const monthPart = parts.find((p) => p.type === "month");
  const n = monthPart ? parseInt(monthPart.value, 10) : NaN;
  return Number.isFinite(n) && n >= 1 && n <= 12 ? n : new Date().getMonth() + 1;
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
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(
    getCurrentMonthChicago,
  );

  /** Run after React commits and the browser paints — fixes mobile Safari where immediate scrollIntoView from a click often does nothing. */
  const scrollEventsSectionIntoView = React.useCallback(() => {
    const run = () => {
      const el = document.getElementById("events");
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
        <p className="mt-10 text-center text-slate-600">
          No upcoming events at the moment. Check back soon.
        </p>
        <div className="mt-8 w-full flex justify-center">
          <UpcomingEventsMonthFilter
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
        </div>
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

  return (
    <>
      {filteredEvents.length > 0 ? (
        <div className="mt-10 w-full max-w-[1200px] mx-auto">
          <div className="overflow-hidden" style={{ backgroundColor: bgColor }}>
            {filteredEvents.map((e, idx) => (
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
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center text-slate-600">
          No events in this month. Try another filter.
        </p>
      )}

      <div className="mt-8 w-full flex justify-center">
        <UpcomingEventsMonthFilter
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      </div>

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
