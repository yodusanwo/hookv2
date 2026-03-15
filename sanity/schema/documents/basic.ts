import { defineType, defineField } from "sanity";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

/** Individual "basic" topic (e.g. Thawing, Skinning) for the /basics page. Similar to recipe document. */
export const basic = defineType({
  name: "basic",
  type: "document",
  title: "Basic",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", validation: (Rule) => Rule.required() }),
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
      title: "Image",
      options: { accept: IMAGE_ACCEPT },
      validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
    }),
    defineField({
      name: "body",
      type: "array",
      title: "Content",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title ?? "Basic" };
    },
  },
});
