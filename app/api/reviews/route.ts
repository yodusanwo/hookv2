import { NextResponse } from "next/server";
import { getKlaviyoReviews } from "@/lib/klaviyoReviews";

export async function GET() {
  try {
    const reviews = await getKlaviyoReviews();
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("Reviews API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
