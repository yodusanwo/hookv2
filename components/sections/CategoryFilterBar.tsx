"use client";

const FILTER_BUTTON_BASE =
  "text-sm font-semibold transition-colors border-none cursor-pointer inline-flex items-center justify-center flex-shrink-0";
const FILTER_BUTTON_LAYOUT = {
  width: 158,
  height: 45,
  padding: "11px 42px",
  borderRadius: 20,
};
const ACTIVE_BG = "#498CCB";
const INACTIVE_BG = "var(--Blue-Inactive-Button, rgba(73, 140, 203, 0.25))";
const CLEAR_LINK_COLOR = "#498CCB";
const SECTION_ID_PREFIX = "shop-section-";

export function CategoryFilterBar({
  filterOptions,
  selectedValues,
  onChange,
  categoryOptions = [],
}: {
  filterOptions: Array<{ value: string; label: string }>;
  /** Multiple selection: array of selected productType values. Empty = no filter. */
  selectedValues: string[];
  onChange: (values: string[]) => void;
  /** Category/section pills (e.g. Seafood, Subscription Box). Click scrolls to that section. */
  categoryOptions?: Array<{ value: string; label: string }>;
}) {
  const hasSelection = selectedValues.length > 0;

  const toggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const scrollToSection = (value: string) => {
    const el = document.getElementById(`${SECTION_ID_PREFIX}${value}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className="px-4 py-6"
      style={{ backgroundColor: "var(--brand-light-blue-bg)" }}
      aria-label="Filters"
    >
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        {/* Left: Filter by category label + Clear all */}
        <div className="flex flex-col gap-1 shrink-0">
          <h2
            className="text-base font-medium"
            style={{
              color: "#1E1E1E",
              fontFamily: "Inter, var(--font-inter), sans-serif",
            }}
          >
            Filter by category
          </h2>
          {hasSelection && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="bg-transparent border-none cursor-pointer p-0 text-base font-medium underline underline-offset-2 hover:no-underline text-left self-start"
              style={{
                color: CLEAR_LINK_COLOR,
                fontFamily: "Inter, var(--font-inter), sans-serif",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Right: All pills (product types + categories) */}
        <div className="flex flex-wrap gap-2 flex-1">
          {filterOptions.map(({ value, label }) => {
            const isSelected = selectedValues.includes(value);
            return (
              <button
                key={`filter-${value}`}
                type="button"
                onClick={() => toggle(value)}
                className={FILTER_BUTTON_BASE}
                style={{
                  ...FILTER_BUTTON_LAYOUT,
                  backgroundColor: isSelected ? ACTIVE_BG : INACTIVE_BG,
                  color: isSelected ? "#fff" : "#1e3a5f",
                  fontFamily: "Inter, var(--font-inter), sans-serif",
                }}
              >
                {label}
              </button>
            );
          })}
          {categoryOptions.map(({ value, label }) => (
            <button
              key={`cat-${value}`}
              type="button"
              onClick={() => scrollToSection(value)}
              className={FILTER_BUTTON_BASE}
              style={{
                ...FILTER_BUTTON_LAYOUT,
                backgroundColor: INACTIVE_BG,
                color: "#1e3a5f",
                fontFamily: "Inter, var(--font-inter), sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
