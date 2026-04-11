import { NextResponse } from "next/server";
import {
  clearAccessTokenCookie,
  clearAccessTokenExpiryCookie,
  clearRefreshTokenCookie,
  clearIdTokenCookie,
} from "@/lib/authCookie";
import { HEADLESS_STOREFRONT_URL } from "@/lib/customerAccountPortal";

/** After end_session: clear cookies, redirect to `HEADLESS_STOREFRONT_URL` (`NEXT_PUBLIC_SITE_URL`). */
export async function GET() {
  const home = new URL("/", HEADLESS_STOREFRONT_URL).toString();
  const res = NextResponse.redirect(home);
  res.headers.append("Set-Cookie", clearAccessTokenCookie());
  res.headers.append("Set-Cookie", clearAccessTokenExpiryCookie());
  res.headers.append("Set-Cookie", clearRefreshTokenCookie());
  res.headers.append("Set-Cookie", clearIdTokenCookie());
  return res;
}
