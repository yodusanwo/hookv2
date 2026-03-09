import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const ourStoryExtendedBlock = defineType({
  name: "ourStoryExtendedBlock",
  type: "object",
  title: "Our Story Extended",
  description: "Extended Our Story section with quote, dark background, and wave (e.g. for /story page).",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#D4F2FF",
    }),
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({
      name: "introText",
      type: "text",
      title: "Intro text (below heading)",
      description: "Centered paragraph shown directly under the main heading.",
      rows: 2,
    }),
    defineField({
      name: "body",
      type: "array",
      title: "Body",
      of: [{ type: "block" }],
    }),
    defineField({ name: "image", type: "image", title: "Image" }),
    defineField({
      name: "subheading",
      type: "text",
      title: "Subheading (e.g. Who We Are)",
      description: "Use Enter for a line break (e.g. after “Fishing,”). Shown on one line on small screens if needed.",
      rows: 2,
    }),
    defineField({
      name: "cta",
      type: "cta",
      title: "Call to Action",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Our Story Extended", subtitle: title };
    },
  },
});
