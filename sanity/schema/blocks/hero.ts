import { defineType, defineField } from "sanity";
import { SECTION_BACKGROUND_COLOR_LIST } from "../objects/sectionBackgroundColor";
import { IMAGE_ACCEPT, validateImageAsset, IMAGE_ERROR_MESSAGE } from "../objects/imageFieldConfig";

export const heroBlock = defineType({
  name: "heroBlock",
  type: "object",
  title: "Hero",
  fields: [
    defineField({
      name: "backgroundColor",
      type: "string",
      title: "Background color",
      options: { list: [...SECTION_BACKGROUND_COLOR_LIST] },
      initialValue: "#ffffff",
    }),
    defineField({
      name: "variant",
      type: "string",
      title: "Layout",
      options: {
        list: [
          { title: "Default (centered, for homepage)", value: "default" },
          { title: "Story (text lower, for Our Story page)", value: "story" },
        ],
      },
    }),
    defineField({ name: "headline", type: "string", title: "Headline" }),
    defineField({ name: "subline", type: "string", title: "Subline" }),
    defineField({
      name: "cta",
      type: "cta",
      title: "Call to Action",
    }),
    defineField({
      name: "images",
      type: "array",
      title: "Images",
      description:
        "Desktop / large screens. Recommended: **1600×900px** or wider (≈16:9 to 21:9); keep key subject in the center third for cropping.",
      of: [
        {
          type: "image",
          options: { accept: IMAGE_ACCEPT },
          validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
        },
      ],
      options: { layout: "grid" },
    }),
    defineField({
      name: "imagesMobile",
      type: "array",
      title: "Images — mobile (optional)",
      description:
        "Same **order** as **Images**: first row = first slide, second = second slide, etc. On viewports under **768px** wide, each slide uses its mobile image when set; otherwise the desktop image is used. Recommended: **1200×1600px** (portrait 3:4) or **1200×1350px**; keep the subject large—phones crop full-bleed. Optional—leave empty to use desktop images everywhere.",
      of: [
        {
          type: "image",
          options: { accept: IMAGE_ACCEPT },
          validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
        },
      ],
      options: { layout: "grid" },
    }),
    defineField({
      name: "mediaMode",
      type: "string",
      title: "Hero media mode",
      initialValue: "images-only",
      options: {
        list: [
          { title: "Images only", value: "images-only" },
          { title: "Video only", value: "video-only" },
          { title: "Video + images carousel", value: "video-and-images" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "video",
      type: "file",
      title: "Hero video",
      description: "Upload an .mp4 or .webm file for the hero carousel.",
      options: {
        accept: "video/mp4,video/webm,.mp4,.webm",
      },
    }),
    defineField({
      name: "videoPosterImage",
      type: "image",
      title: "Video poster image",
      description: "Shown before the video loads and used as the preload image for video-first heroes.",
      options: { accept: IMAGE_ACCEPT },
      validation: (Rule) => Rule.custom(validateImageAsset).error(IMAGE_ERROR_MESSAGE),
    }),
  ],
  preview: {
    select: { headline: "headline" },
    prepare({ headline }) {
      return { title: "Hero", subtitle: headline };
    },
  },
});
