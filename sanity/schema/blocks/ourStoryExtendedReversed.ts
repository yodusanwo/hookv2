import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const ourStoryExtendedReversedBlock = defineType({
  name: "ourStoryExtendedReversedBlock",
  type: "object",
  title: "Our Story Extended (Reversed)",
  description:
    "Same as Our Story Extended but copy on the left, image on the right.",
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
      title: "Subheading",
      description:
        "Use Enter for a line break. Shown above the body text.",
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
      return { title: "Our Story Extended (Reversed)", subtitle: title };
    },
  },
});
