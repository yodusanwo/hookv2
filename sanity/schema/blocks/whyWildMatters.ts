import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const whyWildMattersBlock = defineType({
  name: "whyWildMattersBlock",
  type: "object",
  title: "Why Wild Matters",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#d4f2ff",
    }),
    defineField({ name: "title", type: "string", title: "Title", initialValue: "WHY WILD MATTERS" }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 3,
      description: "Intro paragraph below the title",
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      description: "Large image on the left",
      options: { accept: IMAGE_ACCEPT },
      validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
    }),
    defineField({
      name: "points",
      type: "array",
      title: "Points",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", type: "string", title: "Title" }),
            defineField({ name: "description", type: "text", title: "Description", rows: 3 }),
            defineField({
              name: "icon",
              type: "image",
              title: "Icon",
              description: "Small line-art icon (e.g. SVG or PNG)",
              options: { accept: IMAGE_ACCEPT },
              validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            }),
          ],
          preview: {
            select: { title: "title" },
            prepare({ title }) {
              return { title: title || "Point" };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "cta",
      type: "object",
      title: "Learn More CTA",
      description: "Link shown below the points (e.g. “Learn more →”). Leave label or URL empty to hide.",
      fields: [
        defineField({
          name: "label",
          type: "string",
          title: "Label",
          initialValue: "Learn more",
        }),
        defineField({
          name: "href",
          type: "string",
          title: "Link URL",
          description: "Full URL or path (e.g. /our-story or https://...)",
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Why Wild Matters", subtitle: title };
    },
  },
});
