import { defineType, defineField } from "sanity";
import {
  IMAGE_ACCEPT,
  validateImageAsset,
  IMAGE_ERROR_MESSAGE,
} from "../objects/imageFieldConfig";

/** Individual "basic" topic (e.g. Thawing, Skinning) for the /basics page. Similar to recipe document. */
export const basic = defineType({
  name: "basic",
  type: "document",
  title: "Basic",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sortOrder",
      type: "number",
      title: "Sort order",
      description: "Order on the /basics page. Lower numbers appear first.",
      initialValue: 0,
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Hero image",
      description:
        "Large image shown at the top (e.g. vacuum-sealed fillets for Thawing).",
      options: { accept: IMAGE_ACCEPT },
      validation: (Rule) =>
        Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
    }),
    defineField({
      name: "body",
      type: "array",
      title: "Content (legacy)",
      description:
        "Simple portable text. Use Sections below for the structured layout (heading, subtitle, lists).",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "sections",
      type: "array",
      title: "Sections",
      description:
        "Structured content blocks. Use Row: “Under title” for the right column below the heading, or “Bottom two columns” then Column (Left/Right) for the second row.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "row",
              type: "string",
              title: "Row",
              options: {
                list: [
                  { value: "top", title: "Under title (right column)" },
                  { value: "bottom", title: "Bottom two columns" },
                ],
              },
              initialValue: "top",
              description:
                "Under title = right column below the page title. Bottom two columns = second row with left/right columns.",
            },
            {
              name: "column",
              type: "string",
              title: "Column",
              options: {
                list: [
                  { value: "left", title: "Left" },
                  { value: "right", title: "Right" },
                ],
              },
              initialValue: "left",
              description:
                "Only used when Row is “Bottom two columns”. Puts this section in the left or right column below.",
              hidden: ({ parent }) => parent?.row !== "bottom",
            },
            { name: "heading", type: "string", title: "Heading" },
            {
              name: "subtitle",
              type: "string",
              title: "Subtitle",
              description:
                "Shown in blue italic below the heading (e.g. “Best Overall Thawing Method”).",
            },
            {
              name: "listItems",
              type: "array",
              title: "Bullet list",
              of: [{ type: "string" }],
              description:
                "Use for step lists. Leave empty if using Body text instead.",
            },
            {
              name: "body",
              type: "array",
              title: "Body text",
              of: [{ type: "block" }],
              description:
                "Paragraphs. Leave empty if using Bullet list instead.",
            },
            defineField({
              name: "image",
              type: "image",
              title: "Image",
              options: { accept: IMAGE_ACCEPT },
              validation: (Rule) =>
                Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            }),
          ],
          preview: {
            select: { heading: "heading" },
            prepare({ heading }) {
              return { title: heading || "Section" };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title ?? "Basic" };
    },
  },
});
