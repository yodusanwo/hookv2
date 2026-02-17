import { createClient, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

let _client: SanityClient | undefined;

export const client: SanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production",
    })
  : (null as unknown as SanityClient);

/** GROQ query for site settings (singleton) */
export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
  headerLogo { asset-> },
  headerBackgroundColor,
  promoBanner,
  navLinks[] { label, href }
}`;

/** GROQ query for homepage (page with slug "home") */
export const HOMEPAGE_QUERY = `*[_type == "page" && slug.current == "home"][0] {
  _id,
  title,
  slug,
  sections[] {
    _type,
    _key,
    ...,
    cta { label, href },
    images[] { asset-> },
    image { asset-> },
    body,
    "productRefs": productRefs[] { shopifyHandle, featuredImageIndex },
    "filterCollections": filterCollections[] { label, collectionHandle },
    "items": items[] { label, url, logo { asset-> }, logoWidth, logoHeight, logoAspectRatio }
  }
}`;
