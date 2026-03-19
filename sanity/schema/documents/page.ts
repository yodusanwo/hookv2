import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const page = defineType({
  name: "page",
  type: "document",
  title: "Page",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({
      name: "description",
      type: "text",
      title: "Description / Subheading",
      description:
        "Optional. On the Recipes page (slug: recipes) this is the subheading below the title. Leave empty to hide the subheading. You can also set it in the Recipes block in Sections below.",
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title" },
    }),
    defineField({
      name: "footerWaveBackgroundColor",
      type: "string",
      title: "Color above footer",
      description:
        "Background color of the area above the footer (the wave strip). Leave empty for default.",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
    }),
    defineField({
      name: "hideHeaderWave",
      type: "boolean",
      title: "Hide top wave",
      description:
        "When on, the wave graphic below the header is hidden on this page (e.g. for Our Story Extended).",
      initialValue: false,
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
        { type: "theBasicsSectionBlock" },
        { type: "basicsBlock" },
        { type: "categorySectionBlock" },
      ],
    }),
  ],
});
