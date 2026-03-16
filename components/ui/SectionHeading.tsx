"use client";

type SectionHeadingProps = {
  title: string;
  description?: string;
  variant: "display" | "standard" | "section";
  theme?: "light" | "dark";
  /** When true (display variant only), description uses larger lead style */
  descriptionAsLead?: boolean;
  /** When true (display variant only), uses wider max-width on desktop so headlines stay on one line */
  wideTitleOnDesktop?: boolean;
  /** Override headline color (e.g. #111827) */
  titleColor?: string;
  /** Override body/description color (e.g. #1E1E1E) */
  descriptionColor?: string;
  /** Override letter-spacing for the title (e.g. responsive: tracking-[0.04em] md:tracking-[0.05em] lg:tracking-[0.06em]) */
  titleLetterSpacingClass?: string;
  /** Override font family for the title (e.g. var(--font-zamenhof)) */
  titleFontFamily?: string;
  /** Override font size for the title (e.g. 48) */
  titleFontSize?: number;
  /** Override font weight for the title (e.g. 600) */
  titleFontWeight?: number;
  /** Override line height for the title (e.g. "normal") */
  titleLineHeight?: string | number;
  /** Optional extra class names for the description (e.g. mobile text-left text-xs font-semibold sm:text-center) */
  descriptionClassName?: string;
};

export function SectionHeading({
  title,
  description,
  variant,
  theme = "light",
  descriptionAsLead = false,
  wideTitleOnDesktop = false,
  titleColor,
  descriptionColor,
  titleLetterSpacingClass,
  titleFontFamily,
  titleFontSize,
  titleFontWeight,
  titleLineHeight,
  descriptionClassName,
}: SectionHeadingProps) {
  const isDark = theme === "dark";
  const resolvedTitleColor = titleColor ?? (isDark ? "var(--section-heading-dark)" : "var(--section-heading-light)");
  const resolvedDescColor = descriptionColor ?? (isDark ? "var(--section-heading-dark)" : "var(--section-heading-light)");

  if (variant === "section") {
    return (
      <div className="mx-auto">
        <h2 className="section-title">{title}</h2>
        {description && (
          <p className="section-description-block mt-4 w-full px-4">
            {description}
          </p>
        )}
      </div>
    );
  }

  if (variant === "display") {
    const containerMaxW =
      descriptionAsLead
        ? "max-w-[1100px]"
        : wideTitleOnDesktop
          ? "max-w-4xl lg:max-w-6xl xl:max-w-7xl"
          : "max-w-4xl";
    return (
      <div className={`mx-auto ${containerMaxW}`}>
        <h2
          className={`text-center uppercase tracking-[0.04em] md:tracking-[0.05em] lg:tracking-[0.06em] ${titleLetterSpacingClass ?? ""}`.trim()}
          style={{
            fontFamily: titleFontFamily ?? "var(--font-inter), Inter, sans-serif",
            fontSize: titleFontSize != null ? titleFontSize : "var(--section-heading-display-size)",
            fontStyle: "normal",
            fontWeight: titleFontWeight != null ? titleFontWeight : "var(--section-heading-display-weight)",
            lineHeight: titleLineHeight ?? "var(--section-heading-display-line-height)",
            color: resolvedTitleColor,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`section-description ${descriptionAsLead ? "section-description--lead" : ""} ${descriptionClassName ?? ""}`.trim()}
            style={{
              color: resolvedDescColor,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontStyle: "normal",
              ...(descriptionClassName
                ? { lineHeight: "normal" }
                : { fontSize: 16, fontWeight: 400, lineHeight: "150%", textAlign: "center" as const }),
            }}
          >
            {description}
          </p>
        )}
      </div>
    );
  }

  const titleClass = `text-center text-2xl font-semibold tracking-tight ${titleColor ? "" : isDark ? "text-white" : "text-slate-900"}`;
  return (
    <div>
      <h2 className={titleClass} style={titleColor ? { color: titleColor } : undefined}>{title}</h2>
      {description && (
        <p
          className="section-description"
          style={{
            color: descriptionColor ?? (isDark ? "var(--section-heading-dark)" : "#1E1E1E"),
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 16,
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "150%",
            textAlign: "center",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
