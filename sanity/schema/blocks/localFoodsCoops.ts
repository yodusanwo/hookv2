import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const localFoodsCoopsBlock = defineType({
  name: "localFoodsCoopsBlock",
  type: "object",
  title: "Local Foods Co-ops",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#D4F2FF",
    }),
    defineField({ name: "title", type: "string", title: "Title", initialValue: "LOCAL FOODS CO-OPS" }),
    defineField({ name: "description", type: "text", title: "Description" }),
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
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label", description: "e.g. Locavana (shown with map pin when no logo)" },
            {
            name: "logo",
            type: "image",
            title: "Logo",
            description: "Optional; if set, logo is shown instead of map pin + label",
            options: { accept: IMAGE_ACCEPT },
            validation: (Rule: { custom: (fn: (v: unknown) => true | string) => { error: (m: string) => unknown } }) =>
              Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
          },
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
