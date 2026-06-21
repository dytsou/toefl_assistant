import { useMemo, useState } from 'react';
import { KEYBOARD_VIEWBOX, QWERTY_KEYS } from '../data/qwertyLayout';

export type HeatmapMode = 'live' | 'session' | 'aggregate';

interface KeyboardHeatmapProps {
  mode: HeatmapMode;
  data: Record<string, number>;
  title?: string;
}

const MIN_OPACITY = 0.08;

export function KeyboardHeatmap({ mode, data, title }: KeyboardHeatmapProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const { maxCount, totalCount } = useMemo(() => {
    const counts = Object.values(data);
    return {
      maxCount: counts.length ? Math.max(...counts) : 0,
      totalCount: counts.reduce((sum, value) => sum + value, 0),
    };
  }, [data]);

  const heading =
    title ??
    (mode === 'live'
      ? 'Live keyboard heatmap'
      : mode === 'session'
        ? 'Session keyboard heatmap'
        : 'Aggregate keyboard heatmap');

  if (totalCount === 0) {
    return (
      <div className="keyboard-heatmap keyboard-heatmap-empty" aria-label={heading}>
        <p className="keyboard-heatmap-empty-text">Start typing to see heatmap</p>
        <svg
          viewBox={`0 0 ${KEYBOARD_VIEWBOX.width} ${KEYBOARD_VIEWBOX.height}`}
          className="keyboard-heatmap-svg keyboard-heatmap-svg-muted"
          role="img"
          aria-hidden="true"
        >
          {QWERTY_KEYS.map((key) => (
            <rect
              key={key.id}
              x={key.x}
              y={key.y}
              width={key.width}
              height={key.height}
              rx={6}
              className="keyboard-key keyboard-key-empty"
            />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="keyboard-heatmap">
      <h4 className="keyboard-heatmap-title" id={`heatmap-${mode}`}>
        {heading}
      </h4>
      {activeKey && (
        <p className="keyboard-heatmap-tooltip" aria-live="polite">
          {activeKey}: {data[activeKey] ?? 0} presses
        </p>
      )}
      <svg
        viewBox={`0 0 ${KEYBOARD_VIEWBOX.width} ${KEYBOARD_VIEWBOX.height}`}
        className="keyboard-heatmap-svg"
        role="img"
        aria-labelledby={`heatmap-${mode}`}
      >
        {QWERTY_KEYS.map((key) => {
          const count = data[key.id] ?? 0;
          const opacity =
            maxCount > 0
              ? Math.max(MIN_OPACITY, count / maxCount)
              : MIN_OPACITY;

          return (
            <g key={key.id}>
              <rect
                x={key.x}
                y={key.y}
                width={key.width}
                height={key.height}
                rx={6}
                className="keyboard-key"
                style={{ opacity }}
                tabIndex={0}
                aria-label={`${key.label}: ${count} presses`}
                onMouseEnter={() => setActiveKey(key.label)}
                onMouseLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(key.label)}
                onBlur={() => setActiveKey(null)}
              />
              <text
                x={key.x + key.width / 2}
                y={key.y + key.height / 2}
                className="keyboard-key-label"
                pointerEvents="none"
              >
                {key.label.length > 6 ? key.label.slice(0, 3) : key.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
