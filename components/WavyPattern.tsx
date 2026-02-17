"use client";

/**
 * SVG-based layered wave pattern. Two smooth wave shapes with offset create
 * a subtle 3D/depth effect. Replaces the wavy 1.png image asset.
 */
export function WavyPattern({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  const viewBoxWidth = 612;
  const viewBoxHeight = 133;

  // Smooth wavy path: flat top, undulating bottom. Phase/amplitude vary per layer for depth.
  const buildWavePath = (phase: number, amplitude: number) => {
    const points: { x: number; y: number }[] = [];
    const len = viewBoxWidth + 120;
    const steps = 40;
    for (let i = -1; i <= steps + 1; i++) {
      const x = -60 + (i / (steps + 2)) * len;
      const t = (i / (steps + 2));
      const y =
        viewBoxHeight -
        15 -
        amplitude *
          (Math.sin(t * Math.PI * 2.2 + phase) * 0.6 + Math.sin(t * Math.PI * 1.4 + phase * 0.7) * 0.4);
      points.push({ x, y });
    }
    const topY = -5;
    let d = `M ${points[0].x} ${topY} L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 2] ?? points[i - 1];
      const p1 = points[i - 1];
      const p2 = points[i];
      const p3 = points[i + 1] ?? points[i];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
    }
    d += ` L ${points[points.length - 1].x} ${topY} Z`;
    return d;
  };

  const backPath = buildWavePath(0, 28);
  const frontPath = buildWavePath(0.15, 24);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
      {...props}
    >
      {/* Back wave – darker, slightly offset to create depth */}
      <path
        d={backPath}
        fill="#2a5a7a"
        fillOpacity={0.95}
      />
      {/* Front wave – lighter, main visible layer */}
      <path
        d={frontPath}
        fill="#498CCB"
        fillOpacity={0.9}
      />
    </svg>
  );
}
