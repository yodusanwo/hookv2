# Shopify Customer Account API — Headless login setup

For **login** and **logout** to use your headless app (e.g. https://hookv2.vercel.app) instead of Shopify’s native flow, you need:

1. **Environment variables in Vercel** (so the app enables the “Log in” button and uses your callback URL).
2. **URLs allowlisted in Shopify** (Callback URI, Logout URI, Javascript origin).

If `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` is **not** set in production, the account page only shows “Open account on Shopify”, which sends users to the store’s native login (shopify.com/authentication/... with redirect to shopify.com/.../account/callback). Headless login is then never used.

---

## 1. Vercel — Environment variables (do this first)

**Vercel** → Project → **Settings** → **Environment Variables**.

| Variable | Required | Where to get it |
|----------|----------|------------------|
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | Yes | Shopify Admin → **Sales channels** → **Headless** → your storefront → **Customer Account API** → Client ID |
| `SHOPIFY_STORE_DOMAIN` | Yes | Your store domain, e.g. `your-store.myshopify.com` (no `https://`) |

- Add both for **Production** (and Preview if you test there).
- **Redeploy** after adding so the new env is used.

Without these, `isCustomerAccountConfigured()` is false and the app never shows the “Log in” link to `/auth/login`; users only get “Open account on Shopify” and hit the native flow.

---

## 2. Shopify — Application setup (URLs)

**Shopify Admin** → Your app / **Headless** → **Customer Account API** → **Application setup**.

| Field | Purpose | Value |
|-------|---------|--------|
| **Callback URI(s)** | OAuth **login** — where Shopify redirects after sign-in | `https://hookv2.vercel.app/auth/callback` |
| **Logout URI** | Where Shopify redirects after logout | `https://hookv2.vercel.app/auth/post-logout` |
| **Javascript origin(s)** | Allowed origin | `https://hookv2.vercel.app` |

- **Callback URI** must be the **login** callback (`/auth/callback`), not the logout URL. If you only add `/auth/post-logout` here, login will redirect to Shopify’s theme/app flow instead of your app.

---

## Checklist

1. **Vercel:** Set `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` and `SHOPIFY_STORE_DOMAIN` → redeploy.
2. **Shopify:** Callback URI(s) = `https://hookv2.vercel.app/auth/callback`, Logout URI = `https://hookv2.vercel.app/auth/post-logout`, Javascript origin = `https://hookv2.vercel.app`.
3. Open https://hookv2.vercel.app/account — you should see the **“Log in”** button.
4. Click **Log in** — flow should go to `/auth/login` → Shopify → back to `https://hookv2.vercel.app/auth/callback` → your app.
