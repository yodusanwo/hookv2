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
  navLinks[] { label, href },
  shopPageCollectionSections[] { title, description, collectionHandle, layout, blendWhiteWithBackground },
  shopFilterOptions[] { label, value, insertAfterCategory },
  freeShippingMessage,
  estimatedDeliveryProcessingDays,
  estimatedDeliveryTransitDays,
  estimatedDeliveryCutoffTime,
  estimatedDeliveryFrozenProcessingDays,
  estimatedDeliveryFrozenTransitDays
}`;

/** GROQ query for page layout settings by path (slug). Use with $slug (e.g. "calendar", "contact", "story", "home"). */
export const PAGE_LAYOUT_SETTINGS_QUERY = `*[_type == "page" && slug.current == $slug][0] {
  "color": footerWaveBackgroundColor,
  "hideHeaderWave": hideHeaderWave
}`;

/** GROQ query for any page by slug (for dynamic routes). Use with $slug. */
export const PAGE_BY_SLUG_QUERY = `*[_type == "page" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  sections[] {
    _type,
    _key,
    ...,
    cta { label, href },
    images[] { asset-> },
    galleryImages[] { image, alt, caption, badge },
    teamMembers[] { _key, image, name, role },
    image { asset-> },
    body,
    "productRefs": productRefs[] { shopifyHandle, featuredImageIndex },
    "filterCollections": filterCollections[] { label, collectionHandle, image },
    "items": items[] { label, url, logo { asset-> }, logoWidth, logoHeight, logoAspectRatio, logoScalePercent }
  }
}`;

/** GROQ query for contact page (page with slug "contact") */
export const CONTACT_PAGE_QUERY = `*[_type == "page" && slug.current == "contact"][0] {
  _id,
  title,
  slug,
  sections[] {
    _type,
    _key,
    ...
  }
}`;

/** GROQ query for story page (page with slug "story") */
export const STORY_PAGE_QUERY = `*[_type == "page" && slug.current == "story"][0] {
  _id,
  title,
  slug,
  sections[] {
    _type,
    _key,
    ...,
    cta { label, href },
    images[] { asset-> },
    galleryImages[] { image, alt, caption, badge },
    teamMembers[] { _key, image, name, role },
    image { asset-> },
    body,
    "productRefs": productRefs[] { shopifyHandle, featuredImageIndex },
    "filterCollections": filterCollections[] { label, collectionHandle, image },
    "items": items[] { label, url, logo { asset-> }, logoWidth, logoHeight, logoAspectRatio, logoScalePercent }
  }
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
    galleryImages[] { image, alt, caption, badge },
    teamMembers[] { _key, image, name, role },
    image { asset-> },
    body,
    "productRefs": productRefs[] { shopifyHandle, featuredImageIndex },
    "filterCollections": filterCollections[] { label, collectionHandle, image },
    "items": items[] { label, url, logo { asset-> }, logoWidth, logoHeight, logoAspectRatio, logoScalePercent }
  }
}`;

/** GROQ query for the first Explore Products block from the home page (for use on recipe pages, etc.). */
export const EXPLORE_PRODUCTS_BLOCK_QUERY = `*[_type == "page" && slug.current == "home"][0].sections[_type == "exploreProductsBlock"][0] {
  _type,
  _key,
  backgroundColor,
  hideWave,
  title,
  description,
  "filterCollections": filterCollections[] { label, collectionHandle, image { asset-> } }
}`;

/** GROQ query for the first Catch of the Day (product carousel) block from the home page. Used on /shop page. */
export const CATCH_OF_THE_DAY_BLOCK_QUERY = `*[_type == "page" && slug.current == "home"][0].sections[_type == "catchOfTheDayBlock"][0] {
  _type,
  _key,
  backgroundColor,
  title,
  description,
  "filterCollections": filterCollections[] { label, collectionHandle },
  cta { label, href }
}`;

/** Title and description from the Sanity "Recipes" page (first recipesBlock). Use for /recipes page heading. */
export const RECIPES_PAGE_CONTENT_QUERY = `*[_type == "page" && slug.current == "recipes"][0].sections[_type == "recipesBlock"][0] {
  title,
  description,
  backgroundColor
}`;

/** GROQ query for all recipes (for index page). Includes ingredient category slugs for filter (from filterCategory reference). */
export const RECIPES_LIST_QUERY = `*[_type == "recipe"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  "mainImage": images[0] { asset-> },
  "ingredientHandles": ingredients[].productHandle,
  "ingredientCategorySlugs": ingredients[].filterCategory->slug.current
}`;

/** All recipe categories for the /recipes page filter buttons. Create and manage in Studio under Recipe Categories. */
export const RECIPE_CATEGORIES_QUERY = `*[_type == "recipeCategory"] | order(title asc) {
  "value": slug.current,
  "label": title
}`;

/** GROQ query for a single recipe by slug. Use with $slug (e.g. "salmon-piccata"). */
export const RECIPE_BY_SLUG_QUERY = `*[_type == "recipe" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  "images": images[] { _ref, asset-> },
  ingredients[] { text, productHandle },
  directions[] { step }
}`;

/** GROQ query for a collection page (collectionPage document whose collectionHandle matches) */
export const COLLECTION_PAGE_QUERY = `*[_type == "collectionPage" && collectionHandle == $handle][0] {
  _id,
  title,
  collectionHandle,
  sections[] {
    _type,
    _key,
    ...,
    cta { label, href },
    images[] { asset-> },
    galleryImages[] { image, alt, caption, badge },
    teamMembers[] { _key, image, name, role },
    image { asset-> },
    body,
    "productRefs": productRefs[] { shopifyHandle, featuredImageIndex },
    "filterCollections": filterCollections[] { label, collectionHandle, image },
    "items": items[] { label, url, logo { asset-> }, logoWidth, logoHeight, logoAspectRatio, logoScalePercent }
  }
}`;
