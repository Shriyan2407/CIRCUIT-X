import { EDGE_DEFS, NODE_IDS, NODE_POS, edgeKey } from '@/lib/network';

/**
 * Used when WebGL is unavailable. Draws the same topology as static SVG so the
 * story still reads. Same node positions, projected onto the screen plane.
 */
export function Fallback() {
  const xs = NODE_IDS.map((id) => NODE_POS[id][0]);
  const ys = NODE_IDS.map((id) => NODE_POS[id][1]);
  const minX = Math.min(...xs) - 1;
  const maxX = Math.max(...xs) + 1;
  const minY = Math.min(...ys) - 1;
  const maxY = Math.max(...ys) + 1;
  const sx = (x: number) => ((x - minX) / (maxX - minX)) * 100;
  const sy = (y: number) => (1 - (y - minY) / (maxY - minY)) * 100;

  return (
    <svg className="fallback-scene" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="CIRCUIT-X network topology">
      {EDGE_DEFS.map((e) => {
        const a = NODE_POS[e.a];
        const b = NODE_POS[e.b];
        return (
          <line
            key={edgeKey(e.a, e.b)}
            x1={sx(a[0])}
            y1={sy(a[1])}
            x2={sx(b[0])}
            y2={sy(b[1])}
            stroke="#4a4a4a"
            strokeWidth="0.25"
          />
        );
      })}
      {NODE_IDS.map((id) => (
        <g key={id} transform={`translate(${sx(NODE_POS[id][0])} ${sy(NODE_POS[id][1])})`}>
          <rect x="-1.4" y="-1.4" width="2.8" height="2.8" fill="#0b0b0b" stroke="#a0a0a0" strokeWidth="0.25" />
          <text y="-2.4" textAnchor="middle" fill="#ffffff" fontSize="2.4" fontFamily="monospace">
            {id}
          </text>
        </g>
      ))}
    </svg>
  );
}
