import {
  addCountedDays,
  findConsecutiveProcessingBlock,
  type DeliveryCalendarConfig,
} from "@/lib/estimatedDeliveryCalendar";
import type { DayRange } from "@/lib/parseSanityDayRange";

export type EstimatedDeliveryTimeline = {
  purchasedDate: Date;
  /** After minimum processing days (earliest ship). */
  processingEndMin: Date;
  /** After maximum processing days (latest ship / handoff — transit counts from here). */
  processingEndMax: Date;
  /** First calendar day of the min-processing scenario block (tracker “Processing” start). */
  processingDisplayStart: Date;
  /** Last calendar day of the max-processing scenario block (tracker “Processing” end). */
  processingDisplayEnd: Date;
  /** First day in the delivery window. */
  deliveryEarliest: Date;
  /** Last day in the delivery window. */
  deliveryLatest: Date;
};

/**
 * Shared timeline math for PDP and Sanity preview (same rules: weekdays + blocked dates).
 *
 * **Processing (ambient and frozen):** **calendar-consecutive** runs only — each processing
 * “day” in the count must be adjacent calendar days that are all allowed processing weekdays
 * (e.g. Mon–Fri in a row for a 5-day ambient window). If a run isn’t available from the order
 * date, the next valid block is used.
 *
 * **Transit** is counted from **processingEndMax** without counting the ship day as a transit
 * day when transit ≥ 1 (first transit day is the next calendar day), so **0 transit days**
 * means arrival on the **same calendar day** as handoff.
 */
export function computeEstimatedDeliveryTimeline(
  today: Date,
  processing: DayRange,
  transit: DayRange,
  calendar: DeliveryCalendarConfig,
): EstimatedDeliveryTimeline {
  const d = new Date(today);
  d.setHours(0, 0, 0, 0);

  const blocked = new Set(calendar.blockedDateKeys);
  const processingWeekdays = new Set(calendar.processingWeekdays);
  const transitWeekdays = new Set(calendar.transitWeekdays);

  const purchasedDate = new Date(d);
  const blockMin = findConsecutiveProcessingBlock(
    d,
    processing.min,
    processingWeekdays,
    blocked,
  );
  const blockMax = findConsecutiveProcessingBlock(
    d,
    processing.max,
    processingWeekdays,
    blocked,
  );
  let processingEndMin = blockMin.end;
  let processingEndMax = blockMax.end;
  if (processingEndMin.getTime() > processingEndMax.getTime()) {
    const swapEnd = processingEndMin;
    processingEndMin = processingEndMax;
    processingEndMax = swapEnd;
  }

  const displayStartT = Math.min(blockMin.start.getTime(), blockMax.start.getTime());
  const displayEndT = Math.max(blockMin.end.getTime(), blockMax.end.getTime());
  const processingDisplayStart = new Date(displayStartT);
  const processingDisplayEnd = new Date(displayEndT);

  const shipDate = processingEndMax;
  const deliveryEarliest = addCountedDays(
    shipDate,
    transit.min,
    transitWeekdays,
    blocked,
  );
  const deliveryLatest = addCountedDays(
    shipDate,
    transit.max,
    transitWeekdays,
    blocked,
  );

  let earliest = deliveryEarliest;
  let latest = deliveryLatest;
  if (earliest.getTime() > latest.getTime()) {
    earliest = deliveryLatest;
    latest = deliveryEarliest;
  }

  return {
    purchasedDate,
    processingEndMin,
    processingEndMax,
    processingDisplayStart,
    processingDisplayEnd,
    deliveryEarliest: earliest,
    deliveryLatest: latest,
  };
}
