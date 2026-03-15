import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

/** Block for the Basics page content (title, description, background). Same role as recipesBlock for /recipes. */
export const basicsBlock = defineType({
  name: "basicsBlock",
  type: "object",
  title: "Basics Page Content",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#d4f2ff",
    }),
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Basics Page", subtitle: title };
    },
  },
});
