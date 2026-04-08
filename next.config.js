/** @type {import('next').NextConfig} */

/**
 * Shared CSP directives (everything except script-src / script-src-elem variants).
 * Klaviyo: `*.klaviyo.com`, styles from static.klaviyo.com (see Klaviyo CSP docs).
 * GTM + GA4: `app/components/GoogleTagManager.tsx`.
 * Facebook Pixel (often injected via GTM): `https://connect.facebook.net` → `fbevents.js`.
 */
const cspShared = [
  "default-src 'self'",
  // Klaviyo onsite injects stylesheets; blocking style-src caused "Loading chunk … styles.*.js failed" on Vercel.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static.klaviyo.com https://*.klaviyo.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://static.klaviyo.com https://*.klaviyo.com",
  "font-src 'self' https://fonts.gstatic.com data: https://static.klaviyo.com https://*.klaviyo.com",
  "img-src 'self' data: https: blob:",
  "media-src 'self' https: blob:",
  "connect-src 'self' https://*.sanity.net https://*.sanity.io https://*.api.sanity.io wss://*.api.sanity.io https://core.sanity.com https://core.sanity-cdn.com https://*.shopify.com https://*.klaviyo.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://stats.g.doubleclick.net https://www.google.com https://www.googleadservices.com wss: https:",
  "frame-src 'self' https://*.shopify.com https://checkout.shopify.com https://*.sanity.io https://*.sanity.net https://www.youtube.com https://www.youtube-nocookie.com https://*.klaviyo.com https://www.googletagmanager.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://*.klaviyo.com https://a.klaviyo.com",
  "object-src 'none'",
];

/**
 * Main site (not /studio): no unsafe-eval — not required for Next/React in production
 * (see Next.js CSP docs). Keeps `unsafe-inline` for the GTM inline `next/script` snippet;
 * removing it needs per-request nonces + dynamic rendering or a non-inline GTM load.
 */
const cspMainProduction = [
  ...cspShared.slice(0, 1),
  "script-src 'self' 'unsafe-inline' https://core.sanity.com https://core.sanity-cdn.com https://static.klaviyo.com https://*.klaviyo.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  "script-src-elem 'self' 'unsafe-inline' https://core.sanity.com https://core.sanity-cdn.com https://static.klaviyo.com https://*.klaviyo.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  ...cspShared.slice(1),
].join("; ");

/**
 * Embedded Sanity Studio (`/studio`) — keep unsafe-eval (and inline) for the Studio bundle / tooling.
 */
const cspStudioProduction = [
  ...cspShared.slice(0, 1),
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity.com https://core.sanity-cdn.com https://static.klaviyo.com https://*.klaviyo.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity.com https://core.sanity-cdn.com https://static.klaviyo.com https://*.klaviyo.com https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  ...cspShared.slice(1),
].join("; ");

const baseSecurityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "payment=(self)",
      "usb=()",
    ].join(", "),
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/wild",
        destination: "/wild-vs-farmed",
        permanent: true,
      },
      {
        source: "/story",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/story/:path*",
        destination: "/about/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    /** CSP skipped in dev to avoid chunk/HMR issues. Production: stricter CSP on main site; full policy on /studio. */
    if (process.env.NODE_ENV !== "production") {
      return [{ source: "/:path*", headers: baseSecurityHeaders }];
    }
    const cspStudio = [...baseSecurityHeaders, { key: "Content-Security-Policy", value: cspStudioProduction }];
    const cspMain = [...baseSecurityHeaders, { key: "Content-Security-Policy", value: cspMainProduction }];
    return [
      { source: "/studio", headers: cspStudio },
      { source: "/studio/:path*", headers: cspStudio },
      { source: "/:path*", headers: cspMain },
    ];
  },
};

module.exports = nextConfig;
