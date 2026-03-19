"use client";

import * as React from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/* Use global filter pill colors for consistency (recipes, shop, calendar) */
const BLUE_ACTIVE = "var(--filter-pill-active-bg)";
const BLUE_INACTIVE = "var(--filter-pill-inactive-bg)";

const BUTTON_BASE_STYLE: React.CSSProperties = {
  display: "flex",
  width: 143.568,
  height: 40.89,
  padding: "9.995px 38.164px",
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0,
  borderRadius: 20,
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontWeight: 600,
  fontSize: "0.909rem",
  lineHeight: "normal",
  color: "var(--filter-pill-active-color)",
  whiteSpace: "nowrap",
  transition: "background-color 0.2s",
  border: "none",
  cursor: "pointer",
};

export function UpcomingEventsMonthFilter({
  selectedMonth,
  onMonthChange,
}: {
  selectedMonth: number | null;
  onMonthChange: (month: number | null) => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 w-full"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
      role="group"
      aria-label="Filter by month"
    >
      {/* Months: two rows of 6, centered */}
      <div className="flex flex-wrap justify-center gap-2">
        {MONTHS.slice(0, 6).map((label, idx) => {
          const monthNum = idx + 1;
          const isSelected = selectedMonth === monthNum;
          return (
            <button
              key={monthNum}
              type="button"
              onClick={() => onMonthChange(isSelected ? null : monthNum)}
              style={{
                ...BUTTON_BASE_STYLE,
                backgroundColor: isSelected ? BLUE_ACTIVE : BLUE_INACTIVE,
                color: isSelected ? "var(--filter-pill-active-color)" : "var(--filter-pill-inactive-color)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {MONTHS.slice(6, 12).map((label, idx) => {
          const monthNum = idx + 7;
          const isSelected = selectedMonth === monthNum;
          return (
            <button
              key={monthNum}
              type="button"
              onClick={() => onMonthChange(isSelected ? null : monthNum)}
              style={{
                ...BUTTON_BASE_STYLE,
                backgroundColor: isSelected ? BLUE_ACTIVE : BLUE_INACTIVE,
                color: isSelected ? "var(--filter-pill-active-color)" : "var(--filter-pill-inactive-color)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
