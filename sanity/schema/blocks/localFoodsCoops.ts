import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const localFoodsCoopsBlock = defineType({
  name: "localFoodsCoopsBlock",
  type: "object",
  title: "Local Foods Co-ops",
  description:
    "Edit title, description, and **Logo Buttons** on the **Home** page — that content is reused on Story, Calendar, and other pages that include this block. On other pages, only **Background color** below is page-specific.",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      description:
        "Per-page only. Title, description, and logos come from the **Home** page block when the site merges sections.",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#D4F2FF",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      initialValue: "LOCAL FOODS CO-OPS",
      description: "Edit on **Home** for the copy shown site-wide.",
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Edit on **Home** for the subtitle shown site-wide.",
    }),
    defineField({
      name: "body",
      type: "array",
      title: "Body",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      options: { accept: IMAGE_ACCEPT },
      validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
    }),
    defineField({
      name: "logoButtons",
      type: "array",
      title: "Logo Buttons",
      description: "Edit on **Home** — co-op logos and links appear everywhere this section is used.",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label", description: "e.g. Locavana (shown with map pin when no logo)" },
            defineField({
              name: "logo",
              type: "image",
              title: "Logo",
              description: "Optional; if set, logo is shown instead of map pin + label",
              options: { accept: IMAGE_ACCEPT },
              validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            }),
            { name: "url", type: "url", title: "Link URL" },
            { name: "bordered", type: "boolean", title: "Show border", initialValue: false, description: "Optional light border around this item" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Local Foods Co-ops", subtitle: title };
    },
  },
});
