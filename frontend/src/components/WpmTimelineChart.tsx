import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WpmTimelinePoint } from '../types/typingStats';

interface WpmTimelineChartProps {
  timeline: WpmTimelinePoint[];
  title?: string;
}

export function WpmTimelineChart({ timeline, title = 'WPM over time' }: WpmTimelineChartProps) {
  const chartId = 'wpm-timeline-chart';

  if (timeline.length === 0) {
    return <p className="text-muted text-sm">No timeline data for this session.</p>;
  }

  return (
    <div className="wpm-timeline-chart">
      <h5 id={chartId} className="typing-segments-title">
        {title}
      </h5>
      <div role="img" aria-labelledby={chartId}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <XAxis
              dataKey="t"
              type="number"
              domain={['dataMin', 'dataMax']}
              label={{ value: 'Elapsed seconds', position: 'insideBottom', offset: -4 }}
            />
            <YAxis label={{ value: 'WPM', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value ?? 0} WPM`, 'WPM']} />
            <Line type="monotone" dataKey="wpm" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>WPM timeline data</caption>
        <thead>
          <tr>
            <th>Seconds</th>
            <th>WPM</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((point) => (
            <tr key={point.t}>
              <td>{point.t}</td>
              <td>{point.wpm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
