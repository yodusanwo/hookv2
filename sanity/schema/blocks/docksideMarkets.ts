import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const docksideMarketsBlock = defineType({
  name: "docksideMarketsBlock",
  type: "object",
  title: "Dockside and Farmers Markets",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#FAFAFC",
    }),
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "items",
      type: "array",
      title: "Items",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "logo", type: "image", title: "Logo" },
            { name: "url", type: "url", title: "Link URL" },
            { name: "logoWidth", type: "number", title: "Logo width (px)", description: "Optional. Default 115. Use for rectangular logos (e.g. 200)." },
            { name: "logoHeight", type: "number", title: "Logo height (px)", description: "Optional. Default 115. Use for rectangular logos (e.g. 75)." },
            { name: "logoAspectRatio", type: "string", title: "Logo aspect ratio", description: "Optional. e.g. \"8/3\" for wide logos. Default \"1/1\"." },
            { name: "logoScalePercent", type: "number", title: "Logo size (%)", description: "Optional. Scale logo by percentage. 100 = default, 120 = 20% larger, 80 = 20% smaller." },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Dockside & Markets", subtitle: title };
    },
  },
});
