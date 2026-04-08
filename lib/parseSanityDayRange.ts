export type DayRange = { min: number; max: number };

function normalizeRange(min: number, max: number): DayRange {
  if (min <= max) return { min, max };
  return { min: max, max: min };
}

/**
 * Parse "2-4", "0-1", or a single integer (exactly n days for both min and max).
 */
export function parseDayRangeFromSanity(
  raw: string | undefined | null,
  defaults: DayRange,
): DayRange {
  const s = raw?.trim() ?? "";
  if (!s) return { ...defaults };

  const pair = s.match(/^(\d+)\s*-\s*(\d+)$/);
  if (pair) {
    const min = parseInt(pair[1]!, 10);
    const max = parseInt(pair[2]!, 10);
    if (!Number.isNaN(min) && !Number.isNaN(max) && min >= 0 && max <= 120) {
      return normalizeRange(min, max);
    }
    return { ...defaults };
  }

  const single = s.match(/^(\d+)$/);
  if (single) {
    const n = parseInt(single[1]!, 10);
    if (!Number.isNaN(n) && n >= 0 && n <= 120) {
      return { min: n, max: n };
    }
  }

  return { ...defaults };
}

const AMBIENT_TRANSIT_DEFAULT: DayRange = { min: 2, max: 4 };
const FROZEN_TRANSIT_DEFAULT: DayRange = { min: 1, max: 2 };
const AMBIENT_PROCESSING_DEFAULT: DayRange = { min: 2, max: 2 };
const FROZEN_PROCESSING_DEFAULT: DayRange = { min: 1, max: 1 };

export function parseTransitDaysFromSanity(
  raw: string | undefined | null,
  isFrozen: boolean,
): DayRange {
  return parseDayRangeFromSanity(
    raw,
    isFrozen ? FROZEN_TRANSIT_DEFAULT : AMBIENT_TRANSIT_DEFAULT,
  );
}

/**
 * Processing shortest–longest. If `rangeRaw` is empty, uses legacy single number when set; else branch defaults.
 */
export function parseProcessingDaysFromSanity(
  rangeRaw: string | undefined | null,
  legacySingle: number | undefined | null,
  isFrozen: boolean,
): DayRange {
  const defaults = isFrozen
    ? FROZEN_PROCESSING_DEFAULT
    : AMBIENT_PROCESSING_DEFAULT;
  const s = rangeRaw?.trim() ?? "";
  if (s) return parseDayRangeFromSanity(s, defaults);
  if (legacySingle != null && typeof legacySingle === "number" && !Number.isNaN(legacySingle)) {
    const n = Math.max(0, Math.min(120, Math.floor(legacySingle)));
    return { min: n, max: n };
  }
  return { ...defaults };
}
