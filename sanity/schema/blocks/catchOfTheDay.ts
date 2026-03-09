import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const catchOfTheDayBlock = defineType({
  name: "catchOfTheDayBlock",
  type: "object",
  title: "Product Carousel",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#171730",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      initialValue: "CATCH OF THE DAY",
    }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "filterCollections",
      type: "array",
      title: "Filter Tabs",
      description: "Each tab maps to a Shopify collection. Products are fetched from the selected collection.",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label", description: "Button text (e.g. Seafood)" },
            {
              name: "collectionHandle",
              type: "string",
              title: "Collection Handle",
              description: "Shopify collection handle (from collection URL). E.g. seafood, subscription-box",
            },
          ],
          preview: {
            select: { label: "label" },
            prepare({ label }) {
              return { title: label ?? "Filter" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "cta",
      type: "object",
      title: "CTA Button",
      fields: [
        { name: "label", type: "string", title: "Label", initialValue: "SHOP FULL LINEUP →" },
        { name: "href", type: "string", title: "Link", initialValue: "#shop" },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Product Carousel", subtitle: title };
    },
  },
});
