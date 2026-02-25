/**
 * Presentational arrow button for carousels (Product Carousel, etc.).
 * Renders a single arrow icon; prev direction is rotated 180deg.
 */
const ARROW_FORWARD_SRC = "/arrow_forward_ios_50dp_111827_FILL0_wght400_GRAD0_opsz48%204.svg";
const ARROW_SIZE_PX = 38.4;
const ARROW_OFFSET_PX = 70;

const arrowStyle = {
  width: ARROW_SIZE_PX,
  height: ARROW_SIZE_PX,
  filter: "brightness(0) invert(1)" as const,
};

export const CAROUSEL_ARROW_OFFSET_PX = ARROW_OFFSET_PX;

export function CarouselArrow({
  direction,
  disabled,
  onClick,
  ariaLabel,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  const isPrev = direction === "prev";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="absolute top-1/2 z-10 -translate-y-1/2 hidden shrink-0 items-center justify-center bg-transparent disabled:opacity-30 disabled:pointer-events-none md:flex hover:opacity-90"
      style={{
        width: ARROW_SIZE_PX,
        height: ARROW_SIZE_PX,
        ...(isPrev ? { left: -ARROW_OFFSET_PX } : { right: -ARROW_OFFSET_PX }),
      }}
      aria-label={ariaLabel}
    >
      <img
        src={ARROW_FORWARD_SRC}
        alt=""
        aria-hidden
        className={`max-w-full ${isPrev ? "rotate-180" : ""}`}
        style={arrowStyle}
      />
    </button>
  );
}
