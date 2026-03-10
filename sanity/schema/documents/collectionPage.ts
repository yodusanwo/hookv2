import { defineType, defineField } from "sanity";

export const collectionPage = defineType({
  name: "collectionPage",
  type: "document",
  title: "Collection Page",
  description: "Category/collection pages (e.g. /collections/salmon). Create one per Shopify collection handle.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Display name for this collection page (e.g. Salmon).",
    }),
    defineField({
      name: "collectionHandle",
      type: "string",
      title: "Collection handle",
      description:
        "Must match the Shopify collection URL handle (e.g. salmon for /collections/salmon). Find it in Shopify Admin → Products → Collections → [collection] → URL handle.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sections",
      type: "array",
      title: "Sections",
      of: [
        { type: "heroBlock" },
        { type: "catchOfTheDayBlock" },
        { type: "exploreProductsBlock" },
        { type: "ourStoryBlock" },
        { type: "ourStoryExtendedBlock" },
        { type: "ourStoryExtendedReversedBlock" },
        { type: "photoGalleryBlock" },
        { type: "teamBiosBlock" },
        { type: "contactBlock" },
        { type: "dealPromotionsBlock" },
        { type: "reviewsBlock" },
        { type: "recipesBlock" },
        { type: "docksideMarketsBlock" },
        { type: "upcomingEventsBlock" },
        { type: "localFoodsCoopsBlock" },
        { type: "faqBlock" },
        { type: "whyWildMattersBlock" },
      ],
    }),
  ],
});
