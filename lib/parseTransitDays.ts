/** Re-exports — prefer `lib/parseSanityDayRange.ts` for new code. */
export {
  parseDayRangeFromSanity,
  parseProcessingDaysFromSanity,
  parseTransitDaysFromSanity,
  type DayRange,
} from "./parseSanityDayRange";

export type TransitDaysRange = import("./parseSanityDayRange").DayRange;
