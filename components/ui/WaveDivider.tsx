const WAVE_IMG_BASE =
  "relative block w-full h-auto min-h-0 align-bottom";

/** Default overlap: blue wave pulls up over navy */
const DEFAULT_BLUE_OVERLAP =
  "-mt-8 sm:-mt-12 md:-mt-20 lg:-mt-[100px]";

type WaveDividerProps = {
  navySrc: string;
  blueSrc: string;
  /** Extra classes on the wrapper (e.g. z-20 -mt-px, or scaleX(-1)) */
  wrapperClassName?: string;
  /** Extra classes on the navy wave img (e.g. mt-12) */
  navyClassName?: string;
  /** Override blue wave overlap; defaults to standard overlap */
  blueClassName?: string;
};

export function WaveDivider({
  navySrc,
  blueSrc,
  wrapperClassName = "",
  navyClassName = "",
  blueClassName = DEFAULT_BLUE_OVERLAP,
}: WaveDividerProps) {
  return (
    <div
      className={`relative z-10 w-full overflow-visible leading-[0] ${wrapperClassName}`.trim()}
      aria-hidden
    >
      <img
        src={navySrc}
        alt=""
        aria-hidden
        className={`${WAVE_IMG_BASE} z-10 ${navyClassName}`.trim()}
      />
      <img
        src={blueSrc}
        alt=""
        aria-hidden
        className={`${WAVE_IMG_BASE} z-0 ${blueClassName}`.trim()}
      />
    </div>
  );
}
