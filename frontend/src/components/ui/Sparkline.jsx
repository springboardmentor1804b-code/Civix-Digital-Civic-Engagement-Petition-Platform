import React, { useMemo } from "react";

// Lightweight SVG sparkline with optional gradient fill
const Sparkline = ({
  data = [],
  width = 280,
  height = 60,
  stroke = "#E84C3D",
  fill = "rgba(232,76,61,0.18)",
  strokeWidth = 2,
  className = "",
}) => {
  const { pathD, areaD } = useMemo(() => {
    if (!data || data.length === 0) {
      return { pathD: "", areaD: "" };
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const dx = width / Math.max(1, data.length - 1);
    const normalize = (v) => {
      if (max === min) return height / 2; // flat line
      const t = (v - min) / (max - min);
      return height - t * height; // invert y for SVG
    };

    const points = data.map((v, i) => [i * dx, normalize(v)]);
    const path = points
      .map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`))
      .join(" ");

    const area = `${path} L ${width},${height} L 0,${height} Z`;
    return { pathD: path, areaD: area };
  }, [data, height, width]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="sparkline graph"
    >
      {/* Fill area */}
      {areaD && <path d={areaD} fill={fill} />}
      {/* Line */}
      {pathD && (
        <path d={pathD} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      )}
    </svg>
  );
};

export default Sparkline;


