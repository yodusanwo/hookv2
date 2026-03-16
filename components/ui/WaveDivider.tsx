const WAVE_IMG_BASE = "block w-full h-auto min-h-0 align-bottom max-w-full";

type WaveDividerProps = {
  navySrc: string;
  wrapperClassName?: string;
  navyClassName?: string;
  navyOutline?: "top" | "bottom" | "both";
};

export function WaveDivider({
  navySrc,
  wrapperClassName = "",
  navyClassName = "",
  navyOutline,
}: WaveDividerProps) {
  const navyOutlineClass =
    navyOutline === "top"
      ? "navy-wave-outline-top"
      : navyOutline === "bottom"
        ? "navy-wave-outline-bottom"
        : navyOutline === "both"
          ? "navy-wave-outline-both"
          : "";
  return (
    <div
      className={`relative z-10 w-full leading-[0] border-2 border-black ${wrapperClassName}`.trim()}
      aria-hidden
    >
      <img
        src={navySrc}
        alt=""
        aria-hidden
        className={`${WAVE_IMG_BASE} relative z-10 ${navyOutlineClass} ${navyClassName}`.trim()}
      />
    </div>
  );
}
