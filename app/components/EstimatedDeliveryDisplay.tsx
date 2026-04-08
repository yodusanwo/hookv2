"use client";

import * as React from "react";
import type { DeliveryCalendarConfig } from "@/lib/estimatedDeliveryCalendar";
import { computeEstimatedDeliveryTimeline } from "@/lib/estimatedDeliveryTimeline";

/** Timeline must not use SSR `Date` (server TZ/UTC); Studio preview is browser-only with local “today”. */
function useClientTimelineReady(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateMMDD(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Format a date range for the tracker (e.g. "Mar 03 - 10" or "Mar 03 - Mar 10"). */
function formatDateRange(start: Date, end: Date): string {
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  if (sameDay) return formatDateShort(start);
  if (start.getMonth() === end.getMonth()) {
    return `${formatDateShort(start)} - ${end.getDate()}`;
  }
  return `${formatDateShort(start)} - ${formatDateShort(end)}`;
}

/** Pad a number to 2 digits. */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

type EstimatedDeliveryDisplayProps = {
  staticText: string | null;
  processingDaysMin: number;
  processingDaysMax: number;
  transitDaysMin: number;
  transitDaysMax: number;
  /** Weekday sets + blocked dates from Sanity (ambient vs frozen chosen on the server). */
  calendar: DeliveryCalendarConfig;
  /** Optional cutoff time "HH:mm" (24h) for countdown. Leave empty for end-of-day. */
  cutOffTime?: string | null;
};

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function parseCutoff(str: string | null | undefined): { hour: number; minute: number } | null {
  if (!str?.trim()) return null;
  const m = str.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hour = parseInt(m[1]!, 10);
  const minute = parseInt(m[2]!, 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function EstimatedDeliveryDisplay({
  staticText,
  processingDaysMin,
  processingDaysMax,
  transitDaysMin,
  transitDaysMax,
  calendar,
  cutOffTime,
}: EstimatedDeliveryDisplayProps) {
  const timelineReady = useClientTimelineReady();
  const cutoff = React.useMemo(() => parseCutoff(cutOffTime), [cutOffTime]);
  const [countdown, setCountdown] = React.useState<string | null>(null);

  /** Date key (YYYY-MM-DD) used so dates recalculate when day rolls over. */
  const dateKeyRef = React.useRef(
    (() => {
      const d = new Date();
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    })()
  );
  const [dateKey, setDateKey] = React.useState(dateKeyRef.current);

  const dates = React.useMemo(() => {
    if (!timelineReady) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const t = computeEstimatedDeliveryTimeline(
      today,
      { min: processingDaysMin, max: processingDaysMax },
      { min: transitDaysMin, max: transitDaysMax },
      calendar,
    );
    return {
      purchasedDate: t.purchasedDate,
      processingRangeStart: t.processingDisplayStart,
      processingRangeEnd: t.processingDisplayEnd,
      deliveryStart: t.deliveryEarliest,
      deliveryEnd: t.deliveryLatest,
    };
  }, [
    timelineReady,
    dateKey,
    processingDaysMin,
    processingDaysMax,
    transitDaysMin,
    transitDaysMax,
    calendar,
  ]);

  React.useEffect(() => {
    const update = () => {
      const d = new Date();
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      if (key !== dateKeyRef.current) {
        dateKeyRef.current = key;
        setDateKey(key);
      }

      let target: Date;
      if (cutoff) {
        target = new Date();
        target.setHours(cutoff.hour, cutoff.minute, 0, 0);
        if (new Date() >= target) {
          setCountdown(null);
          return;
        }
      } else {
        target = new Date();
        target.setHours(23, 59, 59, 999);
      }
      const ms = target.getTime() - Date.now();
      if (ms <= 0) {
        setCountdown(null);
        return;
      }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setCountdown(`${pad2(h)}:${pad2(m)}:${pad2(s)}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [cutoff]);

  if (staticText?.trim()) {
    return (
      <div
        className="mt-4"
        style={{
          color: "#374151",
          fontFamily: "Inter, var(--font-inter), sans-serif",
          fontSize: "1rem",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "150%",
        }}
      >
        {staticText.trim()}
      </div>
    );
  }

  const startStr = dates ? formatDateMMDD(dates.deliveryStart) : "—";
  const endStr = dates ? formatDateMMDD(dates.deliveryEnd) : "—";
  const processingRange = dates
    ? formatDateRange(dates.processingRangeStart, dates.processingRangeEnd)
    : "—";
  const deliveryRange = dates
    ? formatDateRange(dates.deliveryStart, dates.deliveryEnd)
    : "—";

  return (
    <div className="mt-4 w-full max-w-full" aria-busy={!dates}>
      {/* Top message with countdown and delivery dates */}
      <div
        className="w-full max-w-full text-sm sm:text-base"
        style={{
          color: "#333333",
          fontFamily: "Inter, var(--font-inter), sans-serif",
          lineHeight: "150%",
        }}
      >
        <p className="break-words">
          Order today
          {countdown != null ? (
            <>
              {" "}
              within{" "}
              <span className="font-semibold" style={{ color: "#1E1E1E" }}>
                {countdown}
              </span>
              ,
            </>
          ) : null}{" "}
          you&apos;ll receive{" "}
          <br className="lg:hidden" aria-hidden />
          your package between{" "}
          <span className="font-semibold" style={{ color: "#1E1E1E" }}>
            {startStr}
          </span>{" "}
          to{" "}
          <span className="font-semibold" style={{ color: "#1E1E1E" }}>
            {endStr}
          </span>
        </p>
      </div>

      {/* Delivery progress tracker */}
      <div
        className="mt-4 rounded-lg px-6 py-5"
        style={{
          backgroundColor: "#1C5080",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex items-start">
          {/* Purchased */}
          <div className="flex flex-1 flex-col items-center text-center">
            <div
              className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center text-white"
              aria-hidden
            >
              <ShoppingBagIcon className="h-10 w-10" />
            </div>
            <span className="font-semibold text-white" style={{ fontSize: "0.875rem" }}>
              Purchased
            </span>
            <span className="mt-0.5 text-sm font-normal text-white/90">
              {dates ? formatDateShort(dates.purchasedDate) : "—"}
            </span>
          </div>

          {/* Connector */}
          <div className="relative flex min-w-[24px] flex-1 items-center self-start pt-5">
            <div
              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
              style={{ backgroundColor: "#069400" }}
              aria-hidden
            />
            <div
              className="relative z-10 mx-auto h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: "#069400" }}
              aria-hidden
            />
          </div>

          {/* Processing */}
          <div className="flex flex-1 flex-col items-center text-center">
            <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center" aria-hidden>
              <img
                src="/delivery_truck_speed_24dp_000000_FILL0_wght400_GRAD0_opsz24%201.svg"
                alt=""
                className="h-10 w-10"
                width={40}
                height={40}
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <span className="font-semibold text-white" style={{ fontSize: "0.875rem" }}>
              Processing
            </span>
            <span className="mt-0.5 text-sm font-normal text-white/90">{processingRange}</span>
          </div>

          {/* Connector */}
          <div className="relative flex min-w-[24px] flex-1 items-center self-start pt-5">
            <div
              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
              style={{ backgroundColor: "#069400" }}
              aria-hidden
            />
            <div
              className="relative z-10 mx-auto h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: "#069400" }}
              aria-hidden
            />
          </div>

          {/* Delivered */}
          <div className="flex flex-1 flex-col items-center text-center">
            <div
              className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center text-white"
              aria-hidden
            >
              <LocationPinIcon className="h-10 w-10" />
            </div>
            <span className="font-semibold text-white" style={{ fontSize: "0.875rem" }}>
              Delivered
            </span>
            <span className="mt-0.5 text-sm font-normal text-white/90">{deliveryRange}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
