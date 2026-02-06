import { defineType, defineField } from "sanity";

export const upcomingEventsBlock = defineType({
  name: "upcomingEventsBlock",
  type: "object",
  title: "Upcoming Events",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "events",
      type: "array",
      title: "Events",
      of: [
        {
          type: "object",
          fields: [
            { name: "date", type: "string", title: "Date" },
            { name: "time", type: "string", title: "Time" },
            { name: "name", type: "string", title: "Event Name" },
            { name: "location", type: "string", title: "Location" },
          ],
        },
      ],
    }),
    defineField({
      name: "showAllUrl",
      type: "url",
      title: "Show All Link",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Upcoming Events", subtitle: title };
    },
  },
});
