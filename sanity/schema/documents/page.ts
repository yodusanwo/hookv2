import { defineType, defineField } from "sanity";

export const page = defineType({
  name: "page",
  type: "document",
  title: "Page",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title" },
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
