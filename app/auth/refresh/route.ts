import { NextResponse } from "next/server";
import { refreshCustomerAccessToken } from "@/lib/shopifyCustomerAccount";
import {
  setAccessTokenCookie,
  setAccessTokenExpiryCookie,
  setRefreshTokenCookie,
  setIdTokenCookie,
  getRefreshTokenFromRequest,
  getPreferredRedirectOrigin,
} from "@/lib/authCookie";

/**
 * Rotates OAuth tokens using the refresh_token cookie. Redirect here when the
 * access token is expired (see /account).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = url.searchParams.get("next") ?? "/account";
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/account";
  const origin = getPreferredRedirectOrigin(request);
  const refresh = getRefreshTokenFromRequest(request);
  if (!refresh) {
    return NextResponse.redirect(new URL("/auth/login", origin));
  }
  const nextTokens = await refreshCustomerAccessToken(refresh);
  if (!nextTokens?.access_token) {
    return NextResponse.redirect(new URL("/auth/login", origin));
  }
  const res = NextResponse.redirect(new URL(safeNext, origin));
  res.headers.append("Set-Cookie", setAccessTokenCookie(nextTokens.access_token, origin));
  if (typeof nextTokens.expires_in === "number") {
    res.headers.append("Set-Cookie", setAccessTokenExpiryCookie(nextTokens.expires_in, origin));
  }
  if (nextTokens.refresh_token) {
    res.headers.append("Set-Cookie", setRefreshTokenCookie(nextTokens.refresh_token, origin));
  }
  if (nextTokens.id_token) {
    res.headers.append("Set-Cookie", setIdTokenCookie(nextTokens.id_token, origin));
  }
  return res;
}
