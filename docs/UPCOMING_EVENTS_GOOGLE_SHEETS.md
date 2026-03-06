# Upcoming Events – Google Sheet setup

The Upcoming Events section on the homepage reads events from a Google Sheet. Past dates are automatically hidden.

## Env vars (e.g. in `.env.local`)

- **`GOOGLE_SHEETS_ID`** – Spreadsheet ID (from the sheet URL: `https://docs.google.com/spreadsheets/d/<THIS_ID>/edit`).
- **`GOOGLE_API_KEY`** – Google Cloud API key with Sheets API enabled. Restrict the key to “Google Sheets API” (read-only) in Google Cloud Console.
- **`GOOGLE_SHEETS_RANGE`** (optional) – Range to read, e.g. `Sheet1!A2:D100`. Default: `Sheet1!A2:D500`.

The sheet must be shared so the API key can read it: **Share → “Anyone with the link” → Viewer**. For a private sheet, use a service account and share the sheet with the service account email (not implemented in the default setup).

## Sheet columns (in order)

| Column | Header (row 1) | Example |
|--------|----------------|--------|
| A | Date | `2026-01-03` or any parseable date |
| B | Time | `8:00 AM - 12:30 PM` |
| C | Market Name | `Evanston Farmers Market` |
| D | Address | `616 Lake St, Evanston, IL 60201` |

Row 1 can be headers; data starts from row 2. Only these four columns are used (the site derives “Day” from the Date column). You can set `GOOGLE_SHEETS_RANGE` to include your header row and the code will still work as long as row 1 doesn’t parse as a valid date).

## Behavior

- Events whose **date** is before today (UTC date) are excluded from the site.
- Events are sorted by date ascending.
- The first column on the site shows “Day, Date, Year” (e.g. *Saturday, January 3, 2026*) generated from the Date column.

## API

- **`GET /api/events`** – Returns JSON array of upcoming events (same data the homepage uses). Useful for debugging or other consumers.
