/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Turbopack to use this directory as the workspace root.
  // Fixes "Can't resolve 'tailwindcss' in '/Users/yodusanwo'" when a lockfile exists in the parent dir.
  experimental: {
    turbo: {
      root: __dirname,
    },
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
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
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
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.sanity.net https://*.sanity.io https://*.shopify.com https://*.klaviyo.com wss: https:",
              "frame-src 'self' https://*.shopify.com https://checkout.shopify.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
