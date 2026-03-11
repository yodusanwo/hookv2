import { defineType, defineField } from "sanity";
import { TeamBiosPreview } from "../../components/TeamBiosPreview";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const teamBiosBlock = defineType({
  name: "teamBiosBlock",
  type: "object",
  title: "Team Bios (Our Crew)",
  description:
    "Team member gallery with circular photos, names, and roles. Add, remove, or reorder members; the order in the list is the display order.",
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
      description: "Section heading (e.g. OUR CREW).",
      initialValue: "OUR CREW",
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Intro paragraph below the title.",
      rows: 3,
    }),
    defineField({
      name: "teamMembers",
      type: "array",
      title: "Team members",
      description: "Order of items is the display order. Drag to reorder; add or remove as needed.",
      options: {
        layout: "grid",
        sortable: true,
      },
      of: [
        {
          type: "object",
          name: "teamMember",
          fields: [
            defineField({
              name: "image",
              type: "image",
              title: "Photo",
              options: { hotspot: true, accept: IMAGE_ACCEPT },
              validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
            }),
            defineField({
              name: "name",
              type: "string",
              title: "Name",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "role",
              type: "string",
              title: "Role / affiliation",
              description: "e.g. Alaska Crew, Chicago Crew",
            }),
          ],
          preview: {
            select: { name: "name", role: "role", image: "image" },
            prepare({ name, role, image }) {
              return {
                title: name || "Team member",
                subtitle: role || undefined,
                media: image,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { blockTitle: "title", teamMembers: "teamMembers" },
  },
  components: {
    preview: TeamBiosPreview,
  },
});
