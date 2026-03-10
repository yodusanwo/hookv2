import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const faqBlock = defineType({
  name: "faqBlock",
  type: "object",
  title: "FAQ",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#f2f2f5",
    }),
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "faqs",
      type: "array",
      title: "FAQs",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "categoryTitle",
              type: "string",
              title: "Category title",
              description:
                "Optional. Shown above this group of Q/A (e.g. “Shipping & Delivery”). Leave empty for no category heading.",
            },
            { name: "question", type: "string", title: "Question" },
            { name: "answer", type: "text", title: "Answer" },
          ],
          preview: {
            select: { categoryTitle: "categoryTitle", question: "question" },
            prepare({ categoryTitle, question }) {
              return {
                title: question || "FAQ item",
                subtitle: categoryTitle ? `Category: ${categoryTitle}` : undefined,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "showMoreUrl",
      type: "url",
      title: "Show More Link",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "FAQ", subtitle: title };
    },
  },
});
