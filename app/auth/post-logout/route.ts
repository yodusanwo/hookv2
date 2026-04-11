import { NextResponse } from "next/server";
import { clearAccessTokenCookie, clearIdTokenCookie } from "@/lib/authCookie";
import { CUSTOMER_ACCOUNT_LOGOUT_URL } from "@/lib/customerAccountPortal";

/** Landing page after Shopify end_session — ensures cookies cleared, then native account logout. */
export async function GET() {
  const res = NextResponse.redirect(CUSTOMER_ACCOUNT_LOGOUT_URL);
  res.headers.append("Set-Cookie", clearAccessTokenCookie());
  res.headers.append("Set-Cookie", clearIdTokenCookie());
  return res;
}
