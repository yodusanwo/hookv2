const WAVE_IMG_BASE = "block w-full h-auto min-h-0 align-bottom max-w-full";

const DEFAULT_BLUE_OVERLAP = "blue-wave-overlap";

type WaveDividerProps = {
  navySrc: string;
  blueSrc: string;
  wrapperClassName?: string;
  navyClassName?: string;
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
      className={`relative z-10 w-full leading-[0] ${wrapperClassName}`.trim()}
      aria-hidden
    >
      {/* Navy wave - allowed to overflow vertically so top isn't clipped */}
      <img
        src={navySrc}
        alt=""
        aria-hidden
        className={`${WAVE_IMG_BASE} relative z-10 ${navyClassName}`.trim()}
      />
      {/* Blue wave wrapped in overflow-hidden to clip right edge bleed only */}
      <div className="overflow-hidden w-full">
        <img
          src={blueSrc}
          alt=""
          aria-hidden
          className={`${WAVE_IMG_BASE} relative z-0 ${blueClassName}`.trim()}
        />
      </div>
    </div>
  );
}
