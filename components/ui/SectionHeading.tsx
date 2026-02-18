"use client";

type SectionHeadingProps = {
  title: string;
  description?: string;
  variant: "display" | "standard";
  theme?: "light" | "dark";
  /** When true (display variant only), description uses larger lead style */
  descriptionAsLead?: boolean;
  /** Override headline color (e.g. #111827) */
  titleColor?: string;
  /** Override body/description color (e.g. #1E1E1E) */
  descriptionColor?: string;
};

export function SectionHeading({
  title,
  description,
  variant,
  theme = "light",
  descriptionAsLead = false,
  titleColor,
  descriptionColor,
}: SectionHeadingProps) {
  const isDark = theme === "dark";
  const resolvedTitleColor = titleColor ?? (isDark ? "var(--section-heading-dark)" : "var(--section-heading-light)");
  const resolvedDescColor = descriptionColor ?? (isDark ? "var(--section-heading-dark)" : undefined);

  if (variant === "display") {
    return (
      <div className={`mx-auto ${descriptionAsLead ? "max-w-[1100px]" : "max-w-4xl"}`}>
        <h2
          className="text-center"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "var(--section-heading-display-size)",
            fontWeight: "var(--section-heading-display-weight)",
            lineHeight: "var(--section-heading-display-line-height)",
            letterSpacing: "var(--section-heading-display-spacing)",
            color: resolvedTitleColor,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mx-auto text-center ${descriptionAsLead ? "max-w-[1100px]" : "max-w-2xl"} ${
              descriptionAsLead
                ? "mt-4 text-base leading-[135%] md:text-[20px]"
                : "mt-3 text-sm leading-relaxed"
            } ${!descriptionColor && isDark ? "text-slate-300" : !descriptionColor ? "text-slate-600" : ""}`}
            style={
              descriptionColor || descriptionAsLead
                ? {
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    color: descriptionColor ?? resolvedDescColor,
                  }
                : undefined
            }
          >
            {description}
          </p>
        )}
      </div>
    );
  }

  const titleClass = `text-center text-2xl font-semibold tracking-tight ${titleColor ? "" : isDark ? "text-white" : "text-slate-900"}`;
  const descClass = `mt-2 text-center text-sm ${descriptionColor ? "" : isDark ? "text-slate-300" : "text-slate-600"}`;

  return (
    <div>
      <h2 className={titleClass} style={titleColor ? { color: titleColor } : undefined}>{title}</h2>
      {description && <p className={descClass} style={descriptionColor ? { color: descriptionColor } : undefined}>{description}</p>}
    </div>
  );
}
