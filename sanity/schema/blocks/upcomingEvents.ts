import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";

export const upcomingEventsBlock = defineType({
  name: "upcomingEventsBlock",
  type: "object",
  title: "Upcoming Events",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#f1f5f9",
    }),
    defineField({ name: "title", type: "string", title: "Title", initialValue: "UPCOMING EVENTS" }),
    defineField({ name: "description", type: "text", title: "Description" }),
    defineField({
      name: "images",
      type: "array",
      title: "Promotional Images",
      description: "Two images displayed side-by-side above the event list (e.g. market/event photos).",
      validation: (Rule) => Rule.max(2),
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "events",
      type: "array",
      title: "Events",
      of: [
        {
          type: "object",
          fields: [
            { name: "date", type: "string", title: "Date", description: "e.g. January 03, 2026" },
            { name: "time", type: "string", title: "Time", description: "e.g. 08:00 AM - 12:30 PM" },
            { name: "eventType", type: "string", title: "Event Type / Location", description: "e.g. Evanston Farmers Markets" },
            { name: "address", type: "string", title: "Address", description: "Full address, e.g. Immanuel Lutheran Church, 616 Lake St, Evanston, IL 60201, USA" },
          ],
          preview: {
            select: { eventType: "eventType", date: "date" },
            prepare({ eventType, date }) {
              return { title: eventType || "Event", subtitle: date };
            },
          },
        },
      ],
    }),
    defineField({
      name: "showAllUrl",
      type: "url",
      title: "Show All Events Link",
      description: "URL for the 'Show all events' CTA.",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: "Upcoming Events", subtitle: title };
    },
  },
});
