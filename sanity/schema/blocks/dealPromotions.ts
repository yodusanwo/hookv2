import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const dealPromotionsBlock = defineType({
  name: "dealPromotionsBlock",
  type: "object",
  title: "Deal & Promotions",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#171730",
    }),
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "productRefs",
      type: "array",
      title: "Products",
      of: [{ type: "productReference" }],
    }),
    defineField({
      name: "maxProducts",
      type: "number",
      title: "Max products",
      description: "Maximum number of products to show (1–12). Leave empty for 6.",
      validation: (Rule) => Rule.min(1).max(12).integer(),
      initialValue: 6,
    }),
    defineField({
      name: "layout",
      type: "string",
      title: "Layout",
      options: { list: ["grid", "carousel"] },
      initialValue: "grid",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Deal & Promotions", subtitle: title };
    },
  },
});
