import { NextResponse } from "next/server";
import { clearAccessTokenCookie, clearIdTokenCookie } from "@/lib/authCookie";
import { HEADLESS_STOREFRONT_URL } from "@/lib/customerAccountPortal";

/**
 * Landing page after Shopify end_session. Clears headless cookies, then sends the
 * browser to the storefront — not account.hookpointfish.com/authentication/logout,
 * which can redirect to the default Online Store (*.myshopify.com/?country=…).
 */
export async function GET() {
  const home = new URL("/", HEADLESS_STOREFRONT_URL).toString();
  const res = NextResponse.redirect(home);
  res.headers.append("Set-Cookie", clearAccessTokenCookie());
  res.headers.append("Set-Cookie", clearIdTokenCookie());
  return res;
}
