/** @type {import('next').NextConfig} */
const csp = [
  "default-src 'self'",
  // Klaviyo may load scripts from subdomains; `*.klaviyo.com` matches their guidance for CSP.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity.com https://core.sanity-cdn.com https://static.klaviyo.com https://*.klaviyo.com",
  "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity.com https://core.sanity-cdn.com https://static.klaviyo.com https://*.klaviyo.com",
  // Klaviyo onsite injects stylesheets from static.klaviyo.com (forms / chunks); blocked style-src caused "Loading chunk … styles.*.js failed" on Vercel. Dev skips CSP — see headers() below.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static.klaviyo.com https://*.klaviyo.com",
  "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://static.klaviyo.com https://*.klaviyo.com",
  "font-src 'self' https://fonts.gstatic.com data: https://static.klaviyo.com https://*.klaviyo.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.sanity.net https://*.sanity.io https://*.api.sanity.io wss://*.api.sanity.io https://core.sanity.com https://core.sanity-cdn.com https://*.shopify.com https://*.klaviyo.com wss: https:",
  "frame-src 'self' https://*.shopify.com https://checkout.shopify.com https://*.sanity.io https://*.sanity.net https://www.youtube.com https://www.youtube-nocookie.com https://*.klaviyo.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://*.klaviyo.com https://a.klaviyo.com",
  "object-src 'none'",
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
    ];
  },
  async headers() {
    /** CSP is skipped in dev to avoid chunk/HMR issues (e.g. “Loading chunk … styles.*.js failed”). Production still enforces CSP. */
    const headers =
      process.env.NODE_ENV === "production"
        ? [...baseSecurityHeaders, { key: "Content-Security-Policy", value: csp }]
        : baseSecurityHeaders;
    return [{ source: "/:path*", headers }];
  },
};

module.exports = nextConfig;
