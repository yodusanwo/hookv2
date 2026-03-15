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

export function CalendarEventsListWithFilter({
  events,
  showAllUrl,
  bgColor,
}: {
  events: Event[];
  showAllUrl?: string | null;
  bgColor: string;
}) {
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);

  const availableYears = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;
    const years = new Set<number>([currentYear, nextYear]);
    for (const e of events) {
      if (e.eventYear != null) years.add(e.eventYear);
    }
    return Array.from(years).sort((a, b) => a - b);
  }, [events]);

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (selectedYear != null && e.eventYear !== selectedYear) return false;
      if (selectedMonth != null && e.eventMonth !== selectedMonth) return false;
      return true;
    });
  }, [events, selectedYear, selectedMonth]);

  if (events.length === 0) {
    return (
      <>
        <p className="mt-10 text-center text-slate-600">
          No upcoming events at the moment. Check back soon.
        </p>
        <div className="mt-8">
          <UpcomingEventsMonthFilter
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            availableYears={availableYears}
          />
        </div>
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
          No events in this month. Try another filter.
        </p>
      )}

      <div className="mt-8">
        <UpcomingEventsMonthFilter
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableYears={availableYears}
        />
      </div>

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
  );
}
