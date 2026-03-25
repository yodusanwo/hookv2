/** @type {import('next').NextConfig} */
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
              // Bridge loads from core.sanity-cdn.com. script-src-elem mirrors script-src so injected <script src=…> is allowed in all browsers.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity.com https://core.sanity-cdn.com",
              "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://core.sanity.com https://core.sanity-cdn.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.sanity.net https://*.sanity.io https://*.api.sanity.io wss://*.api.sanity.io https://core.sanity.com https://core.sanity-cdn.com https://*.shopify.com https://*.klaviyo.com wss: https:",
              "frame-src 'self' https://*.shopify.com https://checkout.shopify.com https://*.sanity.io https://*.sanity.net https://www.youtube.com https://www.youtube-nocookie.com",
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
