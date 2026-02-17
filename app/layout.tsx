import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { client, SITE_SETTINGS_QUERY } from "@/lib/sanity";
import { urlFor } from "@/lib/sanityImage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Hook Point — Wild Alaskan Fish",
  description: "From our family to yours.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headerLogoUrl: string | null = null;
  let navLinks: { label?: string; href?: string }[] = [];
  let headerBackgroundColor: string | null = null;
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    try {
      const settings = await client.fetch<{
        headerLogo?: { asset?: { _ref?: string } };
        headerBackgroundColor?: string;
        navLinks?: Array<{ label?: string; href?: string }>;
      } | null>(SITE_SETTINGS_QUERY, {}, { next: { revalidate: 60 } });
      const img = urlFor(settings?.headerLogo);
      if (img) headerLogoUrl = img.url();
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <Header
          logoUrl={headerLogoUrl}
          navLinks={navLinks}
          backgroundColor={headerBackgroundColor}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
