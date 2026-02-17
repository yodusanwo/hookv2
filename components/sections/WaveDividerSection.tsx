const OVERLAY_BASE = { width: "105%", transform: "translateX(calc(-50% - 25px)) translateY(110px) scaleX(-1) scaleY(-1)" } as const;

export function WaveDividerSection({ whiteWave = false }: { whiteWave?: boolean }) {
  return (
    <section className="relative z-0 -mt-[100px] min-h-[400px] w-full overflow-visible" style={{ backgroundColor: "var(--brand-light-blue-bg)" }} aria-hidden>
      <div
        className="absolute left-1/2 top-0 z-10"
        style={{ ...OVERLAY_BASE, aspectRatio: "644/171", minHeight: "360px", transform: "translateX(calc(-50% - 25px)) translateY(40px) scaleX(-1) scaleY(-1)" }}
      >
        <img src="/7 1.png" alt="" className="h-full w-full object-cover object-top" />
      </div>
      <div
        className="absolute left-1/2 top-0 z-[15]"
        style={{ ...OVERLAY_BASE, aspectRatio: "612/133", minHeight: "350px" }}
      >
        <img
          src="/wavy 1.png"
          alt=""
          className="h-full w-full object-cover object-top"
          style={whiteWave ? { filter: "brightness(0) invert(1)" } : undefined}
        />
      </div>
    </section>
  );
}
