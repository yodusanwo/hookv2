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
  weight: ["400", "500", "600", "700"],
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
        <div className="relative z-20 w-full -mt-px overflow-visible leading-[0]">
          <img
            src="/VectorWavyNavy.svg"
            alt=""
            aria-hidden
            className="relative z-10 block w-full h-auto min-h-0 align-bottom"
          />
          <img
            src="/VectorWavyBlue.svg"
            alt=""
            aria-hidden
            className="relative z-0 block w-full h-auto min-h-0 align-bottom -mt-8 sm:-mt-12 md:-mt-20 lg:-mt-[100px]"
          />
        </div>
        <div className="relative z-0 -mt-[120px] sm:-mt-[150px] lg:-mt-[206px]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
