/** translate3d/backface: WebKit compositing — reduces 1px hairlines at wave seams (Safari). */
const WAVE_IMG_BASE =
  "block h-auto min-h-0 w-full max-w-full align-bottom [transform:translate3d(0,0,0)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

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
      className={`relative z-10 -mb-px w-full leading-[0] ${wrapperClassName}`.trim()}
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
