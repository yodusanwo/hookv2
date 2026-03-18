import { NextResponse } from "next/server";
import { clearAccessTokenCookie, clearIdTokenCookie, getOriginFromRequest } from "@/lib/authCookie";

/** Landing page after Shopify end_session — ensures cookies cleared and user is on headless site. */
export async function GET(request: Request) {
  const origin = getOriginFromRequest(request);
  const res = NextResponse.redirect(new URL("/account", origin));
  res.headers.append("Set-Cookie", clearAccessTokenCookie());
  res.headers.append("Set-Cookie", clearIdTokenCookie());
  return res;
}
