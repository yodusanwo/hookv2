"use client";

type SectionHeadingProps = {
  title: string;
  description?: string;
  variant: "display" | "standard";
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
}: SectionHeadingProps) {
  const isDark = theme === "dark";
  const resolvedTitleColor = titleColor ?? (isDark ? "var(--section-heading-dark)" : "var(--section-heading-light)");
  const resolvedDescColor = descriptionColor ?? (isDark ? "var(--section-heading-dark)" : "var(--section-heading-light)");

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
            fontSize: "var(--section-heading-display-size)",
            fontWeight: "var(--section-heading-display-weight)",
            lineHeight: "var(--section-heading-display-line-height)",
            color: resolvedTitleColor,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`section-description ${descriptionAsLead ? "section-description--lead" : ""}`.trim()}
            style={{
              color: resolvedDescColor,
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
