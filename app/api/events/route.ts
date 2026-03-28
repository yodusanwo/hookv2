import { getEventsFromSheet } from "@/lib/googleSheets";
import { NextResponse } from "next/server";
import { enforceApiRateLimit } from "@/lib/apiRateLimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const limited = enforceApiRateLimit(req, "events");
  if (limited) return limited;

  try {
    const events = await getEventsFromSheet();
    return NextResponse.json(events);
  } catch (e) {
    console.error("GET /api/events failed:", e);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
