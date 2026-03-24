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

/** Shop page only: promo + shop sections + filters (no header, nav, or shipping fields). */
export const SHOP_PAGE_SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
  promoBanner,
  promoBannerUrl,
  shopPageCollectionSections[] { title, description, collectionHandle, layout, blendWhiteWithBackground },
  shopFilterOptions[] { label, value, insertAfterCategory }
}`;

/** GROQ query for site settings (singleton) */
export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0] {
  headerLogo { asset-> },
  headerBackgroundColor,
  promoBanner,
  promoBannerUrl,
  navLinks[] { label, href },
  shopPageCollectionSections[] { title, description, collectionHandle, layout, blendWhiteWithBackground },
  shopFilterOptions[] { label, value, insertAfterCategory },
  freeShippingMessage,
  freeShippingThreshold,
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
    "filterCollections": filterCollections[] { label, collectionHandle, image }
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
    "filterCollections": filterCollections[] { label, collectionHandle, image }
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
    "filterCollections": filterCollections[] { label, collectionHandle, image }
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
  subheading,
  "productRefs": productRefs[] { shopifyHandle, featuredImageIndex },
  "filterCollections": filterCollections[] { label, collectionHandle },
  cta { label, href }
}`;

/** Page-level title/description and first recipesBlock for /recipes. Page fields override block when set. */
export const RECIPES_PAGE_CONTENT_QUERY = `*[_type == "page" && slug.current == "recipes"][0] {
  title,
  description,
  "block": sections[_type == "recipesBlock"][0] {
    title,
    description,
    backgroundColor
  }
}`;

/** Title and description from the Sanity "Basics" page (first basicsBlock). Use for /basics page heading. */
export const BASICS_PAGE_CONTENT_QUERY = `*[_type == "page" && slug.current == "basics"][0].sections[_type == "basicsBlock"][0] {
  title,
  description,
  backgroundColor
}`;

/** All basics for the /basics index page. Ordered by sortOrder then title. */
export const BASICS_LIST_QUERY = `*[_type == "basic"] | order(coalesce(sortOrder, 9999) asc, title asc) {
  _id,
  title,
  "slug": slug.current,
  "mainImage": image { asset-> }
}`;

/** GROQ query for all recipes (for index page). Ordered by sortOrder then title. Includes ingredient category slugs for filter. */
export const RECIPES_LIST_QUERY = `*[_type == "recipe"] | order(coalesce(sortOrder, 9999) asc, title asc) {
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

/** Recipes that reference a product (any ingredient has matching productHandle). Use with $productHandle. */
export const RECIPES_BY_PRODUCT_HANDLE_QUERY = `*[_type == "recipe" && $productHandle in ingredients[].productHandle] | order(coalesce(sortOrder, 9999) asc, title asc) [0...3] {
  _id,
  title,
  "slug": slug.current,
  "mainImage": images[0] { asset-> }
}`;

/** GROQ query for a single recipe by slug. Use with $slug (e.g. "salmon-piccata"). */
export const RECIPE_BY_SLUG_QUERY = `*[_type == "recipe" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  "images": images[] { _ref, asset-> },
  ingredients[] { text, productHandle, shopCategorySegment },
  directions[] { step },
  directionsImage {
    alt,
    "assetRef": asset._ref,
    "assetMeta": asset->{
      metadata { dimensions { width, height } }
    }
  }
}`;
