/** JS weekday: 0 = Sunday … 6 = Saturday */

export const DEFAULT_PROCESSING_WEEKDAYS = [1, 2, 3, 4, 5];

export type DeliveryCalendarConfig = {
  processingWeekdays: number[];
  transitWeekdays: number[];
  blockedDateKeys: string[];
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function dateKeyLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** When unset or invalid, Mon–Fri (matches previous weekend-only behavior). */
export function normalizeWeekdays(raw: unknown): number[] {
  if (raw == null) return [...DEFAULT_PROCESSING_WEEKDAYS];
  if (!Array.isArray(raw)) return [...DEFAULT_PROCESSING_WEEKDAYS];
  const nums = raw
    .map((x) => (typeof x === "number" ? x : parseInt(String(x), 10)))
    .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6);
  const uniq = [...new Set(nums)].sort((a, b) => a - b);
  return uniq.length ? uniq : [...DEFAULT_PROCESSING_WEEKDAYS];
}

/** Sanity `date` values are YYYY-MM-DD or ISO strings. */
export function normalizeBlockedDates(raw: unknown): string[] {
  if (raw == null || !Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const k = item.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) out.push(k);
  }
  return out;
}

export function buildDeliveryCalendarConfig(opts: {
  isFrozen: boolean;
  blockedDates?: unknown;
  processingWeekdaysAmbient?: unknown;
  processingWeekdaysFrozen?: unknown;
  transitWeekdaysAmbient?: unknown;
  transitWeekdaysFrozen?: unknown;
}): DeliveryCalendarConfig {
  const blockedDateKeys = normalizeBlockedDates(opts.blockedDates);
  const processingWeekdays = normalizeWeekdays(
    opts.isFrozen ? opts.processingWeekdaysFrozen : opts.processingWeekdaysAmbient,
  );
  const transitWeekdays = normalizeWeekdays(
    opts.isFrozen ? opts.transitWeekdaysFrozen : opts.transitWeekdaysAmbient,
  );
  return { processingWeekdays, transitWeekdays, blockedDateKeys };
}

/**
 * Advance from `start` by counting `daysToCount` calendar days that fall on
 * `weekdays` and are not in `blocked`. Same stepping semantics as the legacy
 * `addBusinessDays` (first step is start + 1 day).
 */
export function addCountedDays(
  start: Date,
  daysToCount: number,
  weekdays: Set<number>,
  blocked: Set<string>,
): Date {
  const result = new Date(start);
  result.setHours(0, 0, 0, 0);
  let added = 0;
  let safety = 0;
  const maxIter = Math.max(5000, daysToCount * 400);
  while (added < daysToCount && safety < maxIter) {
    safety++;
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    const key = dateKeyLocal(result);
    if (!weekdays.has(dow)) continue;
    if (blocked.has(key)) continue;
    added++;
  }
  return result;
}
