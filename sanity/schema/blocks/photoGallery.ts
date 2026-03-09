import { defineType, defineField } from "sanity";
import { PhotoGalleryPreview } from "../../components/PhotoGalleryPreview";

export const photoGalleryBlock = defineType({
  name: "photoGalleryBlock",
  type: "object",
  title: "Photo Gallery",
  description:
    "Grid of photos with a centered title. Layout uses gridTemplateAreas: p1,p4,p5,p8 span 2 rows (tall); p2,p3,p6,p7,p9 are 1 row (short). Max 9 in main grid.",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({
      name: "galleryImages",
      type: "array",
      title: "Gallery images",
      description:
        "Positions: 1,4,5,8 (tall); 2,3,6,7,9 (short). First 9 images use the grid layout.",
      options: {
        layout: "grid",
        sortable: true,
      },
      of: [
        {
          type: "object",
          name: "galleryImage",
          fields: [
            defineField({ name: "image", type: "image", title: "Image" }),
            defineField({ name: "alt", type: "string", title: "Alt text (for accessibility)" }),
            defineField({ name: "caption", type: "string", title: "Caption (optional)" }),
            defineField({
              name: "badge",
              type: "string",
              title: "Badge (optional)",
              description: "Red badge overlay in bottom-left, e.g. product code",
            }),
          ],
          preview: {
            select: { image: "image", alt: "alt" },
            prepare({ image, alt }) {
              return {
                title: alt || "Gallery image",
                media: image,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(12),
    }),
  ],
  preview: {
    select: { blockTitle: "title", galleryImages: "galleryImages" },
  },
  components: {
    preview: PhotoGalleryPreview,
  },
});
