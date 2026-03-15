import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const theBasicsSectionBlock = defineType({
  name: "theBasicsSectionBlock",
  type: "object",
  title: "The Basics",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#d4f2ff",
    }),
    defineField({ name: "title", type: "string", title: "Title", initialValue: "THE BASICS" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "items",
      type: "array",
      title: "Cards",
      description: "Each card shows an image and label (e.g. Thawing, Skinning, Cooking Temperature). Links to the Basics page or a specific topic.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              type: "image",
              title: "Image",
              options: { accept: IMAGE_ACCEPT },
              validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            }),
            defineField({
              name: "label",
              type: "string",
              title: "Label",
              description: "e.g. Thawing, Skinning, Cooking Temperature",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "slug",
              type: "string",
              title: "Link slug",
              description:
                "Optional. Link to /basics/[slug]. Leave empty to link to /basics. Use URL-safe slug (e.g. thawing, skinning, cooking-temperature).",
            }),
          ],
          preview: {
            select: { label: "label" },
            prepare({ label }) {
              return { title: label ?? "Card" };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "The Basics", subtitle: title };
    },
  },
});
