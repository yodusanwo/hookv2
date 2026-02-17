"use client";

type SectionHeadingProps = {
  title: string;
  description?: string;
  variant: "display" | "standard";
  theme?: "light" | "dark";
  /** When true (display variant only), description uses larger lead style */
  descriptionAsLead?: boolean;
};

export function SectionHeading({
  title,
  description,
  variant,
  theme = "light",
  descriptionAsLead = false,
}: SectionHeadingProps) {
  const isDark = theme === "dark";

  if (variant === "display") {
    return (
      <div className="mx-auto max-w-4xl">
        <h2
          className="text-center"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "var(--section-heading-display-size)",
            fontWeight: "var(--section-heading-display-weight)",
            lineHeight: "var(--section-heading-display-line-height)",
            letterSpacing: "var(--section-heading-display-spacing)",
            color: isDark ? "var(--section-heading-dark)" : "var(--section-heading-light)",
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mx-auto text-center max-w-2xl ${
              descriptionAsLead
                ? "mt-4 text-base leading-[135%] md:text-[20px]"
                : "mt-3 text-sm leading-relaxed"
            } ${isDark ? "text-slate-300" : "text-slate-600"}`}
            style={
              descriptionAsLead
                ? {
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    color: isDark ? "var(--section-heading-dark)" : "var(--section-heading-light)",
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

  const titleClass = isDark
    ? "text-center text-2xl font-semibold tracking-tight text-white"
    : "text-center text-2xl font-semibold tracking-tight text-slate-900";
  const descClass = isDark
    ? "mt-2 text-center text-sm text-slate-300"
    : "mt-2 text-center text-sm text-slate-600";

  return (
    <div>
      <h2 className={titleClass}>{title}</h2>
      {description && <p className={descClass}>{description}</p>}
    </div>
  );
}
