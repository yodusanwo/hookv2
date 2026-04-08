/** Shared validators for Site Settings → Shipping → estimated delivery fields. */

/** Processing and transit day ranges share the same format. */
export function validateDayRangeString(value: string | undefined | null): string | true {
  if (value == null || String(value).trim() === "") return true;
  const s = String(value).trim();
  const pair = s.match(/^(\d+)\s*-\s*(\d+)$/);
  if (pair) {
    const a = parseInt(pair[1]!, 10);
    const b = parseInt(pair[2]!, 10);
    if (Number.isNaN(a) || Number.isNaN(b)) return "Invalid numbers.";
    if (a < 0 || b < 0) return "Values cannot be negative.";
    if (a > b) return "Put the smaller number first (e.g. 0-1, not 1-0).";
    if (b > 120) return "Maximum seems too high (cap 120).";
    return true;
  }
  const single = s.match(/^(\d+)$/);
  if (single) {
    const n = parseInt(single[1]!, 10);
    if (Number.isNaN(n) || n < 0 || n > 120) return "Use a number from 0 to 120.";
    return true;
  }
  return 'Use min–max (e.g. "2-4") or one number (same min and max).';
}

/** @deprecated Use validateDayRangeString */
export const validateTransitDaysRange = validateDayRangeString;

export function validateCutoffTime24h(
  value: string | undefined | null,
): string | true {
  if (value == null || String(value).trim() === "") return true;
  const m = String(value).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 'Use 24h time like "17:00" or "09:30".';
  const h = parseInt(m[1]!, 10);
  const min = parseInt(m[2]!, 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return "Hour must be 0–23, minutes 0–59.";
  return true;
}

/** Prevent duplicate weekday entries in the same list. */
export function validateWeekdayListUnique(value: unknown): string | true {
  if (!Array.isArray(value) || value.length === 0) return true;
  const keys = value.map((x) => String(x));
  const unique = new Set(keys);
  if (unique.size !== keys.length) return "Each weekday should appear at most once.";
  return true;
}

export function validateProcessingDaysCount(
  value: number | undefined | null,
): string | true {
  if (value === undefined || value === null) return true;
  if (typeof value !== "number" || Number.isNaN(value)) return "Must be a number.";
  if (!Number.isInteger(value)) return "Use a whole number (e.g. 2).";
  if (value < 0 || value > 60) return "Use a value from 0 to 60.";
  return true;
}
