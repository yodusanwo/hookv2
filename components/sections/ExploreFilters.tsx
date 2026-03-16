"use client";

import * as React from "react";

const DEFAULT_FILTERS = ["Seafood", "Subscription Box", "Pet Treats, Merch, Gift Cards"];

export function ExploreFilters({
  labels = DEFAULT_FILTERS,
  activeIndex = 0,
  onFilterChange,
}: {
  labels?: string[];
  activeIndex?: number;
  onFilterChange?: (index: number) => void;
}) {
  const [active, setActive] = React.useState(activeIndex);

  React.useEffect(() => {
    setActive(activeIndex);
  }, [activeIndex]);

  const handleClick = (index: number) => {
    setActive(index);
    onFilterChange?.(index);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {labels.map((label, idx) => {
        const isActive = idx === active;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleClick(idx)}
            className="filter-pill-btn rounded-lg px-5 py-2.5 text-base font-normal transition-colors"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              ...(isActive
                ? { backgroundColor: "var(--filter-pill-active-bg)", color: "var(--filter-pill-active-color)" }
                : {
                    backgroundColor: "var(--filter-pill-inactive-bg)",
                    color: "var(--filter-pill-inactive-color)",
                    border: "1px solid rgba(73, 140, 203, 0.4)",
                  }),
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
