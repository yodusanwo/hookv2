import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const docksideMarketsBlock = defineType({
  name: "docksideMarketsBlock",
  type: "object",
  title: "Dockside and Farmers Markets",
  description:
    "Edit this block on the Home page: title, description, and market logos are reused across the site (Calendar, Story, CMS pages). Each page can still set its own background color below so sections can match local page design.",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      description:
        "Section background (including behind logos). Set per page: Calendar and other pages keep their own color here; title, description, and logos still follow the Home page block.",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#FAFAFC",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description:
        "Shown in the carousel heading. Edit this on the Home page — that text is what appears everywhere this block is used (Calendar, Story, other CMS pages).",
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description:
        "Subtitle under the title. Edit on the Home page — same copy is shown on every page that includes this carousel.",
    }),
    defineField({
      name: "items",
      type: "array",
      title: "Market logos",
      description:
        "Add or reorder logos on the Home page block — these are the logos shown everywhere this carousel appears (e.g. Home, Calendar, Story). Each row: logo image, optional link, optional sizing.",
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
