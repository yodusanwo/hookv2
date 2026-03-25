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
  /** Override font family for the title (e.g. var(--font-inter)) */
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
          className={`section-heading text-center uppercase ${titleLetterSpacingClass ?? ""}`.trim()}
          style={{
            fontFamily: titleFontFamily ?? undefined,
            fontSize: titleFontSize != null ? titleFontSize : undefined,
            fontWeight: titleFontWeight != null ? titleFontWeight : undefined,
            lineHeight: titleLineHeight ?? undefined,
            letterSpacing: titleLetterSpacingClass ? undefined : "0%",
            color: resolvedTitleColor,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`section-description ${descriptionAsLead ? "section-description--lead" : ""} ${descriptionClassName ?? ""}`.trim()}
            style={{
              ...(isDark || descriptionColor != null
                ? { color: descriptionColor ?? resolvedDescColor }
                : {}),
              ...(descriptionAsLead && descriptionClassName
                ? { lineHeight: "normal" }
                : {}),
            }}
          >
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2
        className="section-heading text-center"
        style={titleColor ? { color: titleColor } : isDark ? { color: "var(--section-heading-dark)" } : undefined}
      >
        {title}
      </h2>
      {description && (
        <p
          className="section-description"
          style={
            isDark || descriptionColor != null
              ? { color: descriptionColor ?? resolvedDescColor }
              : undefined
          }
        >
          {description}
        </p>
      )}
    </div>
  );
}
