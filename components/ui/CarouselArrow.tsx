/**
 * Presentational arrow button for carousels (Product Carousel, Dockside Markets, etc.).
 * Renders a single arrow icon; prev direction is rotated 180deg.
 * Use theme="light" for dark arrows on light backgrounds; use inset for arrows inside the carousel (always visible).
 */
const ARROW_FORWARD_SRC = "/arrow_forward_ios_50dp_111827_FILL0_wght400_GRAD0_opsz48%204.svg";
const ARROW_SIZE_PX = 38.4;
const ARROW_OFFSET_PX = 70;
const ARROW_INSET_PX = 12;

const arrowStyleWhite = {
  width: ARROW_SIZE_PX,
  height: ARROW_SIZE_PX,
  filter: "brightness(0) invert(1)" as const,
};

/** Dark arrow for light backgrounds – exact #1E1E1E via mask. */
const LIGHT_ARROW_COLOR = "#1E1E1E";
const arrowStyleLight = {
  width: ARROW_SIZE_PX,
  height: ARROW_SIZE_PX,
  backgroundColor: LIGHT_ARROW_COLOR,
  WebkitMaskImage: `url(${ARROW_FORWARD_SRC})`,
  maskImage: `url(${ARROW_FORWARD_SRC})`,
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
} as React.CSSProperties;

export const CAROUSEL_ARROW_OFFSET_PX = ARROW_OFFSET_PX;

export function CarouselArrow({
  direction,
  disabled,
  onClick,
  ariaLabel,
  theme = "dark",
  inset = false,
  insetNoBackground = false,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
  /** "dark" = white arrows (navy sections); "light" = dark arrows (#1E1E1E) on light sections */
  theme?: "light" | "dark";
  /** When true, position arrows inside the carousel (left/right 12px) so they're always visible */
  inset?: boolean;
  /** When true with inset, no background/shadow behind the arrow (transparent button) */
  insetNoBackground?: boolean;
}) {
  const isPrev = direction === "prev";
  const isLight = theme === "light";

  const positionStyle = inset
    ? (isPrev ? { left: ARROW_INSET_PX } : { right: ARROW_INSET_PX })
    : (isPrev ? { left: -ARROW_OFFSET_PX } : { right: -ARROW_OFFSET_PX });

  const isInset = inset;
  const showInsetBackground = isInset && !insetNoBackground;
  const buttonSize = isInset ? ARROW_SIZE_PX + 8 : ARROW_SIZE_PX;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-1/2 z-10 -translate-y-1/2 hidden shrink-0 items-center justify-center disabled:opacity-30 disabled:pointer-events-none md:flex ${
        showInsetBackground
          ? "rounded-full bg-white/95 shadow-md hover:bg-white hover:shadow-lg"
          : "bg-transparent hover:opacity-90"
      }`}
      style={{
        width: buttonSize,
        height: buttonSize,
        ...positionStyle,
      }}
      aria-label={ariaLabel}
    >
      {isLight ? (
        <span
          className={`block ${isPrev ? "rotate-180" : ""}`}
          style={arrowStyleLight}
          aria-hidden
        />
      ) : (
        <img
          src={ARROW_FORWARD_SRC}
          alt=""
          aria-hidden
          className={`max-w-full ${isPrev ? "rotate-180" : ""}`}
          style={arrowStyleWhite}
        />
      )}
    </button>
  );
}
