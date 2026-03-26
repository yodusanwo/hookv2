import type { Metadata } from "next";
import { Geist_Mono, Inter, Mulish } from "next/font/google";
import "./globals.css";

import { SiteLayout } from "./components/SiteLayout";
import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";
import { urlForSizedImage } from "@/lib/sanityImage";
import { isCustomerAccountConfigured } from "@/lib/shopifyCustomerAccount";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["300", "800"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: "Hook Point — Wild Alaskan Fish", template: "%s | Hook Point" },
  description: "From our family to yours. Wild Alaskan seafood, smoked & specialty, pet treats, and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Hook Point",
    title: "Hook Point — Wild Alaskan Fish",
    description: "From our family to yours. Wild Alaskan seafood, smoked & specialty, pet treats, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hook Point — Wild Alaskan Fish",
    description: "From our family to yours. Wild Alaskan seafood, smoked & specialty, pet treats, and more.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headerLogoUrl: string | null = null;
  let navLinks: { label?: string; href?: string }[] = [];
  let headerBackgroundColor: string | null = null;
  let accountUrl: string | null = null;
  const explicitAccountUrl = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL?.trim();
  if (explicitAccountUrl) {
    accountUrl = explicitAccountUrl;
  } else {
    const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");
    if (domain) accountUrl = `https://${domain}/account`;
  }
  const useHeadlessAccount = isCustomerAccountConfigured();
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const settings = await client.fetch<{
        headerLogo?: { asset?: { _ref?: string } };
        headerBackgroundColor?: string;
        navLinks?: Array<{ label?: string; href?: string }>;
      } | null>(SITE_SETTINGS_QUERY, {}, { next: { revalidate: 60 } });
      headerLogoUrl = urlForSizedImage(settings?.headerLogo, 320);
      if (settings?.navLinks && settings.navLinks.length > 0) {
        navLinks = settings.navLinks;
      }
      if (settings?.headerBackgroundColor) {
        headerBackgroundColor = settings.headerBackgroundColor;
      }
    } catch {
      // Use fallback
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} ${inter.variable} ${mulish.variable} antialiased`}
      >
        <SiteLayout
          headerLogoUrl={headerLogoUrl}
          navLinks={navLinks}
          headerBackgroundColor={headerBackgroundColor}
          accountUrl={accountUrl}
          useHeadlessAccount={useHeadlessAccount}
        >
          {children}
        </SiteLayout>
      </body>
    </html>
  );
}
