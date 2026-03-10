import { defineType, defineField } from "sanity";
import { ContactBlockPreview } from "../../components/ContactBlockPreview";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const contactBlock = defineType({
  name: "contactBlock",
  type: "object",
  title: "Contact",
  description: "Contact form section with heading, description, and optional email/phone displayed below the form.",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#d4f2ff",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Section heading (e.g. Contact Us).",
      initialValue: "Contact Us",
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Intro paragraph below the title.",
      rows: 2,
      initialValue:
        "Have a question? Drop a line anytime. We love talking fish and are happy to answer your questions.",
    }),
    defineField({
      name: "email",
      type: "string",
      title: "Email",
      description: "Shown as 'or email us: …'. Leave empty to hide.",
      initialValue: "hello@hookpointfish.com",
    }),
    defineField({
      name: "phone",
      type: "string",
      title: "Phone",
      description: "Shown as 'call us …'. Leave empty to hide.",
      initialValue: "773.888.1040",
    }),
    defineField({
      name: "submitButtonLabel",
      type: "string",
      title: "Submit button label",
      initialValue: "Send Message",
    }),
  ],
  preview: {
    select: { blockTitle: "title", description: "description", email: "email" },
    prepare({ blockTitle, email }) {
      return {
        title: "Contact",
        subtitle: blockTitle ? `${blockTitle}${email ? ` · ${email}` : ""}` : undefined,
      };
    },
  },
  components: {
    preview: ContactBlockPreview,
  },
});
