/** @vitest-environment jsdom */
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WpmTimelineChart } from './WpmTimelineChart';

vi.mock('recharts', async () => {
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  };
});

describe('WpmTimelineChart', () => {
  it('renders chart container for timeline data', () => {
    render(<WpmTimelineChart timeline={[{ t: 10, wpm: 25 }, { t: 20, wpm: 30 }]} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows fallback when timeline is empty', () => {
    render(<WpmTimelineChart timeline={[]} />);
    expect(screen.getByText('No timeline data for this session.')).toBeInTheDocument();
  });
});
