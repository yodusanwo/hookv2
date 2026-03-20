import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://hookv2.vercel.app");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
