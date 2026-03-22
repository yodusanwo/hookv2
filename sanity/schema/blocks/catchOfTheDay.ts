import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const catchOfTheDayBlock = defineType({
  name: "catchOfTheDayBlock",
  type: "object",
  title: "Product Carousel",
  description:
    "The /shop page reuses the first Product Carousel block on the Home page (same content). Editing this block on Home updates the carousel on Shop.",
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
      name: "subheading",
      type: "string",
      title: "Subheading",
      description: "Optional subheading below the title (e.g. uppercase label). Centered, 32px, Inter.",
    }),
    defineField({
      name: "productRefs",
      type: "array",
      title: "Selected Products",
      description: "Choose 2–5 products to display. Layout adjusts automatically (2 = row of 2, 3 = row of 3, 4 = 3 on top + 1 centered below, 5 = 3 on top + 2 centered below).",
      validation: (Rule) =>
        Rule.min(2).max(5).error("Select between 2 and 5 products."),
      of: [{ type: "productReference" }],
    }),
    defineField({
      name: "filterCollections",
      type: "array",
      title: "Filter Tabs (legacy)",
      description: "Deprecated. Use Selected Products above instead.",
      hidden: true,
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "collectionHandle", type: "string", title: "Collection Handle" },
          ],
          preview: { select: { label: "label" }, prepare({ label }) { return { title: label ?? "Filter" }; } },
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
