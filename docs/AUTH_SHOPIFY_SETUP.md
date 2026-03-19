# Shopify Customer Account API — Application setup

For **login** and **logout** to work with your headless app (e.g. https://hookv2.vercel.app), the Shopify app must allowlist the correct URLs.

## Where to set it

**Shopify Admin** → Your app (Headless / Customer Account API) → **Application setup**.

## Required values

| Field | Purpose | Add this URL |
|-------|---------|--------------|
| **Callback URI(s)** | OAuth **login** — where Shopify sends the user after they sign in | `https://hookv2.vercel.app/auth/callback` |
| **Logout URI** | Where Shopify sends the user **after logout** | `https://hookv2.vercel.app/auth/post-logout` |
| **Javascript origin(s)** | Allowed origin for the app | `https://hookv2.vercel.app` |

## Common mistake

- **Callback URI** must be the **login callback** (`/auth/callback`), not the logout URL.
- If Callback URI is set only to `/auth/post-logout`, login will fail or redirect to Shopify’s theme instead of your app.

## Checklist

1. **Callback URI(s):** include `https://hookv2.vercel.app/auth/callback` (and remove any incorrect entry like `/auth/post-logout` from this field).
2. **Logout URI:** include `https://hookv2.vercel.app/auth/post-logout`.
3. **Javascript origin(s):** include `https://hookv2.vercel.app`.
4. Save, then try **Log in** from https://hookv2.vercel.app/account again.
