/**
 * Fetches upcoming events from a Google Sheet and returns only future events,
 * sorted by date. Used by the Upcoming Events section.
 *
 * Dates and "today" for filtering use America/Chicago (Central) timezone.
 *
 * Env: GOOGLE_SHEETS_ID (spreadsheet ID), GOOGLE_API_KEY (API key; sheet must be
 * "Anyone with the link can view" for API key access).
 *
 * Sheet: first row = headers. Columns: Date (YYYY-MM-DD), Time, Market Name, Address.
 * Range is configurable via GOOGLE_SHEETS_RANGE (default "Sheet1!A2:D500").
 */

export type SheetEvent = {
  date: string;
  time: string;
  eventType: string;
  address: string;
};

const DEFAULT_RANGE = "Sheet1!A2:D500";

/** ISO date-only (YYYY-MM-DD) parses as UTC midnight so calendar date is timezone-invariant. */
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (!s) return null;
  const iso = ISO_DATE_ONLY.test(s) ? `${s}T00:00:00.000Z` : s;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

const MARKET_TIMEZONE = "America/Chicago";

function toDisplayDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: MARKET_TIMEZONE,
  });
}

/** Today's date as YYYY-MM-DD in Chicago (for filtering and comparison). */
function getTodayDateStringChicago(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: MARKET_TIMEZONE });
}

/** Event date as YYYY-MM-DD (calendar date from sheet; UTC so server TZ doesn't change it). */
function eventCalendarDateUtc(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "UTC" });
}

export async function getEventsFromSheet(): Promise<SheetEvent[]> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const apiKey = process.env.GOOGLE_API_KEY;
  const range = process.env.GOOGLE_SHEETS_RANGE ?? DEFAULT_RANGE;

  if (!sheetId || !apiKey) {
    return [];
  }

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}`
  );
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.warn("Google Sheets fetch failed:", res.status, await res.text().slice(0, 200));
    return [];
  }

  const data = (await res.json()) as { values?: unknown[] };
  const rows = Array.isArray(data?.values) ? data.values : [];
  const todayChicago = getTodayDateStringChicago();

  const withTimestamp: { sortTime: number; event: SheetEvent }[] = [];

  for (const row of rows) {
    const cells = Array.isArray(row) ? row : [];
    const dateRaw = cells[0];
    const dateParsed = parseDate(dateRaw);
    if (!dateParsed) continue;

    const eventDateStr = eventCalendarDateUtc(dateParsed);
    if (eventDateStr < todayChicago) continue;

    withTimestamp.push({
      sortTime: dateParsed.getTime(),
      event: {
        date: toDisplayDate(dateParsed),
        time: String(cells[1] ?? "").trim() || "—",
        eventType: String(cells[2] ?? "").trim() || "—",
        address: String(cells[3] ?? "").trim() || "—",
      },
    });
  }

  withTimestamp.sort((a, b) => a.sortTime - b.sortTime);
  return withTimestamp.map(({ event }) => event);
}
