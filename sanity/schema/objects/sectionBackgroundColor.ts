/**
 * Shared preset list for section background color.
 * Values are CSS-ready (hex or var()).
 */
export const SECTION_BACKGROUND_COLOR_LIST = [
  { title: "Navy", value: "#171730" },
  { title: "Light blue", value: "#d4f2ff" },
  { title: "Lighter blue", value: "#E6F7FF" },
  { title: "White", value: "#ffffff" },
  { title: "Light gray", value: "#f2f2f5" },
  { title: "Slate 100", value: "#f1f5f9" },
  { title: "Off white", value: "#FAFAFC" },
] as const;

export type SectionBackgroundColorValue = (typeof SECTION_BACKGROUND_COLOR_LIST)[number]["value"];
