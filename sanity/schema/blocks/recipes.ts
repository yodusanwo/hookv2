import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const recipesBlock = defineType({
  name: "recipesBlock",
  type: "object",
  title: "Recipes",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#D4F2FF",
    }),
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "recipes",
      type: "array",
      title: "Recipes",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Recipe Title" },
            defineField({
              name: "image",
              type: "image",
              title: "Image",
              options: { accept: IMAGE_ACCEPT },
              validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            }),
            defineField({
              name: "url",
              type: "string",
              title: "Link URL",
              description: "Internal path (e.g. /recipes/salmon-piccata or just salmon-piccata), or full URL (https://...).",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "showMoreUrl",
      type: "string",
      title: "Show More Link",
      description: "URL for “Show more recipes”. Use /recipes to link to the full recipes index, or a full URL.",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Recipes", subtitle: title };
    },
  },
});
