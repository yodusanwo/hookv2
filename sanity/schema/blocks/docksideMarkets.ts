import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const docksideMarketsBlock = defineType({
  name: "docksideMarketsBlock",
  type: "object",
  title: "Dockside and Farmers Markets",
  description:
    "Single source of truth: edit title, description, and logos on the **Home** page only. Other pages that include this block only use the **background color** below; everything else is pulled from Home automatically.",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      description:
        "Only this field is per-page. Title, description, and logos always come from the **Home** page block.",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#FAFAFC",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description:
        "Edit on **Home** only. Shown everywhere this block appears (Story, Calendar, etc.).",
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 6,
      description:
        "Edit on **Home** only. Subtitle under the title on every page that includes this section. Press **Enter** for a new line, or type `<br>` / `<br/>` where you want a line break.",
    }),
    defineField({
      name: "items",
      type: "array",
      title: "Market logos",
      description:
        "Edit on **Home** only. Logos and links appear everywhere this block is used. Each row: logo image, optional link, optional sizing.",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            defineField({
              name: "logo",
              type: "image",
              title: "Logo",
              options: { accept: IMAGE_ACCEPT },
              validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            }),
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
