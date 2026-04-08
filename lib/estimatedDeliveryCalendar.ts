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

/**
 * First **calendar-consecutive** run of `length` processing days (each on an allowed weekday,
 * not blocked), where the block may start on the order day (`offset` 0) or later.
 *
 * **Length 0:** “No extra processing streak” — handoff is modeled on the **first** allowed
 * processing weekday on or after the order day (not the raw calendar order day). That keeps
 * frozen Mon–Tue schedules from treating a Wednesday order as if processing completed on Wed
 * when Wed is not a warehouse day.
 */
export function findConsecutiveProcessingBlock(
  orderDay: Date,
  length: number,
  weekdays: Set<number>,
  blocked: Set<string>,
): { start: Date; end: Date } {
  const base = new Date(orderDay);
  base.setHours(0, 0, 0, 0);

  if (length <= 0) {
    for (let offset = 0; offset < 400; offset++) {
      const cur = new Date(base);
      cur.setDate(base.getDate() + offset);
      cur.setHours(0, 0, 0, 0);
      const key = dateKeyLocal(cur);
      if (weekdays.has(cur.getDay()) && !blocked.has(key)) {
        return { start: new Date(cur), end: new Date(cur) };
      }
    }
    const fallback = new Date(base);
    return { start: fallback, end: fallback };
  }

  const maxStartOffset = 400;
  for (let startOffset = 0; startOffset < maxStartOffset; startOffset++) {
    const start = new Date(base);
    start.setDate(base.getDate() + startOffset);
    start.setHours(0, 0, 0, 0);

    let ok = true;
    for (let i = 0; i < length; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      const key = dateKeyLocal(cur);
      if (!weekdays.has(cur.getDay()) || blocked.has(key)) {
        ok = false;
        break;
      }
    }
    if (ok) {
      const end = new Date(start);
      end.setDate(start.getDate() + length - 1);
      end.setHours(0, 0, 0, 0);
      return { start, end };
    }
  }
  const fallback = new Date(base);
  return { start: fallback, end: fallback };
}

/**
 * End date of the first valid consecutive processing block (see {@link findConsecutiveProcessingBlock}).
 */
export function findEndOfFirstConsecutiveProcessingBlock(
  orderDay: Date,
  length: number,
  weekdays: Set<number>,
  blocked: Set<string>,
): Date {
  return findConsecutiveProcessingBlock(orderDay, length, weekdays, blocked).end;
}

export type CountedDaysOptions = {
  /**
   * When true (recommended for **processing** days): if the order/start day is itself a
   * processing weekday and not blocked, it counts as the first day. Without this, the
   * algorithm always moved to the next calendar day first — so a **Monday** order on a
   * Mon/Tue-only schedule never used Monday as day 1 (broken for frozen).
   * **Transit** days after ship should keep `false` so day 1 of transit is after pickup.
   */
  includeStartDayIfQualifying?: boolean;
};

function advanceCountedDays(
  start: Date,
  daysToCount: number,
  weekdays: Set<number>,
  blocked: Set<string>,
  options?: CountedDaysOptions,
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

  if (options?.includeStartDayIfQualifying) {
    const key0 = dateKeyLocal(result);
    if (weekdays.has(result.getDay()) && !blocked.has(key0)) {
      added++;
      first = new Date(result);
      first.setHours(0, 0, 0, 0);
      if (added >= daysToCount) {
        return { first, last: new Date(result) };
      }
    }
  }

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
    { includeStartDayIfQualifying: true },
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
  options?: CountedDaysOptions,
): Date {
  return advanceCountedDays(start, daysToCount, weekdays, blocked, options).last;
}
