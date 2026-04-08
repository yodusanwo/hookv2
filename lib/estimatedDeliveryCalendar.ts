/** JS weekday: 0 = Sunday … 6 = Saturday */

export const DEFAULT_PROCESSING_WEEKDAYS = [1, 2, 3, 4, 5];

/** Default frozen warehouse schedule when Sanity list is empty (Mon–Tue only). */
export const DEFAULT_FROZEN_PROCESSING_WEEKDAYS = [1, 2];

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

/**
 * Processing weekdays: ambient defaults Mon–Fri; **frozen defaults Mon–Tue** when unset
 * (typical frozen cut schedule). Explicit Sanity values always win.
 */
export function normalizeProcessingWeekdays(
  raw: unknown,
  isFrozen: boolean,
): number[] {
  const fallback = isFrozen
    ? [...DEFAULT_FROZEN_PROCESSING_WEEKDAYS]
    : [...DEFAULT_PROCESSING_WEEKDAYS];
  if (raw == null) return fallback;
  if (!Array.isArray(raw)) return fallback;
  if (raw.length === 0) return fallback;
  const nums = raw
    .map((x) => (typeof x === "number" ? x : parseInt(String(x), 10)))
    .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6);
  const uniq = [...new Set(nums)].sort((a, b) => a - b);
  return uniq.length ? uniq : fallback;
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

function hasWeekdaySelections(raw: unknown): boolean {
  return Array.isArray(raw) && raw.length > 0;
}

/**
 * Prefer the schedule for the active branch (frozen vs ambient), then the other branch
 * if that list is empty. Covers: only Ambient filled, only Frozen filled, or both.
 */
function resolveProcessingWeekdaysRaw(
  isFrozen: boolean,
  frozen: unknown,
  ambient: unknown,
): unknown {
  if (isFrozen) {
    if (hasWeekdaySelections(frozen)) return frozen;
    if (hasWeekdaySelections(ambient)) return ambient;
    return null;
  }
  if (hasWeekdaySelections(ambient)) return ambient;
  if (hasWeekdaySelections(frozen)) return frozen;
  return null;
}

function resolveTransitWeekdaysRaw(
  isFrozen: boolean,
  frozen: unknown,
  ambient: unknown,
): unknown {
  if (isFrozen) {
    if (hasWeekdaySelections(frozen)) return frozen;
    if (hasWeekdaySelections(ambient)) return ambient;
    return null;
  }
  if (hasWeekdaySelections(ambient)) return ambient;
  if (hasWeekdaySelections(frozen)) return frozen;
  return null;
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
  const processingWeekdays = normalizeProcessingWeekdays(
    resolveProcessingWeekdaysRaw(
      opts.isFrozen,
      opts.processingWeekdaysFrozen,
      opts.processingWeekdaysAmbient,
    ),
    opts.isFrozen,
  );
  const transitWeekdays = normalizeWeekdays(
    resolveTransitWeekdaysRaw(
      opts.isFrozen,
      opts.transitWeekdaysFrozen,
      opts.transitWeekdaysAmbient,
    ),
  );
  return { processingWeekdays, transitWeekdays, blockedDateKeys };
}

function advanceCountedDays(
  start: Date,
  daysToCount: number,
  weekdays: Set<number>,
  blocked: Set<string>,
): { first: Date | null; last: Date } {
  const result = new Date(start);
  result.setHours(0, 0, 0, 0);
  if (daysToCount <= 0) {
    return { first: null, last: new Date(result) };
  }
  let added = 0;
  let first: Date | null = null;
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
    if (first === null) {
      first = new Date(result);
      first.setHours(0, 0, 0, 0);
    }
  }
  const last = new Date(result);
  last.setHours(0, 0, 0, 0);
  return { first, last };
}

/**
 * First and last calendar dates that count toward processing/transit (for tracker labels).
 */
export function countProcessingSpan(
  start: Date,
  daysToCount: number,
  weekdays: Set<number>,
  blocked: Set<string>,
): { first: Date; last: Date } {
  const { first, last } = advanceCountedDays(
    start,
    daysToCount,
    weekdays,
    blocked,
  );
  if (first) return { first, last };
  const z = new Date(start);
  z.setHours(0, 0, 0, 0);
  return { first: z, last: z };
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
  return advanceCountedDays(start, daysToCount, weekdays, blocked).last;
}
