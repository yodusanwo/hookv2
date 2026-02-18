const WAVE_IMG_BASE = "block w-full h-auto min-h-0 align-bottom max-w-full";

/** Default overlap: blue wave pulls up over navy */
const DEFAULT_BLUE_OVERLAP = "-mt-8 sm:-mt-12 md:-mt-20 lg:-mt-[100px]";

type WaveDividerProps = {
  navySrc: string;
  blueSrc: string;
  /** Extra classes on the outer wrapper */
  wrapperClassName?: string;
  /** Extra classes on the div wrapping the navy img (use for width/position overrides) */
  navyWrapperClassName?: string;
  /** Extra classes on the navy wave img (e.g. mt-12) */
  navyClassName?: string;
  /** Override blue wave overlap; defaults to standard overlap */
  blueClassName?: string;
  /**
   * When true, blue wave is absolutely positioned from the bottom so the
   * wrapper height = navy height only. Prevents navy from being clipped on
   * small screens. Pass blueClassName with -translate-y-* for overlap amount.
   */
  blueAbsolute?: boolean;
};

export function WaveDivider({
  navySrc,
  blueSrc,
  wrapperClassName = "",
  navyWrapperClassName = "",
  navyClassName = "",
  blueClassName = DEFAULT_BLUE_OVERLAP,
  blueAbsolute = false,
}: WaveDividerProps) {
  return (
    <div
      className={`relative z-10 w-full min-w-0 max-w-full overflow-visible leading-[0] ${wrapperClassName}`.trim()}
      aria-hidden
    >
      <div className={navyWrapperClassName || undefined}>
        <img
          src={navySrc}
          alt=""
          aria-hidden
          className={`${WAVE_IMG_BASE} relative z-10 ${navyClassName}`.trim()}
        />
      </div>
      <img
        src={blueSrc}
        alt=""
        aria-hidden
        className={
          blueAbsolute
            ? `absolute bottom-0 left-0 z-0 w-full h-auto min-h-0 ${blueClassName}`.trim()
            : `${WAVE_IMG_BASE} relative z-0 ${blueClassName}`.trim()
        }
      />
    </div>
  );
}
