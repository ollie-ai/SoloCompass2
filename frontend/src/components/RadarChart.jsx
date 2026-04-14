import { useMemo } from 'react';

const RadarChart = ({ scores, size = 280 }) => {
  const styles = ['cultural', 'relax', 'adventure', 'foodie', 'history', 'nature'];
  const labels = {
    cultural: 'Cultural',
    relax: 'Relax',
    adventure: 'Adventure',
    foodie: 'Foodie',
    history: 'History',
    nature: 'Nature'
  };
  
  const data = styles.map(style => ({
    label: labels[style] || style,
    value: Math.min(100, Math.max(0, Math.round((scores[style] || 0) / Math.max(...Object.values(scores), 3) * 100)))
  }));

  const center = size / 2;
  const radius = (size - 60) / 2;
  const levels = 5;
  const angleStep = (2 * Math.PI) / data.length;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  });

  const gridPoints = useMemo(() => {
    const grids = [];
    for (let l = 1; l <= levels; l++) {
      const levelRadius = (l / levels) * radius;
      const levelPoints = data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return {
          x: center + levelRadius * Math.cos(angle),
          y: center + levelRadius * Math.sin(angle)
        };
      });
      grids.push(levelPoints);
    }
    return grids;
  }, [center, radius, levels, data, angleStep]);

  const axisPoints = data.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {gridPoints.map((level, i) => (
          <polygon
            key={`grid-${i}`}
            points={level.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axisPoints.map((p, i) => (
          <line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Data polygon */}
        <path
          d={pathD}
          fill="rgba(16, 185, 129, 0.2)"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="6"
            fill="#10b981"
            stroke="#fff"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 28;
          const labelX = center + labelRadius * Math.cos(angle);
          const labelY = center + labelRadius * Math.sin(angle);
          const anchor = Math.abs(angle) < 0.1 ? 'middle' : angle > -Math.PI / 2 && angle < Math.PI / 2 ? 'start' : 'end';
          
          return (
            <text
              key={`label-${i}`}
              x={labelX}
              y={labelY}
              textAnchor={anchor}
              className="text-xs font-bold fill-slate-600"
              dominantBaseline="middle"
            >
              {d.label} ({d.value}%)
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;
