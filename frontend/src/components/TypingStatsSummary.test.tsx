/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypingStatsSummary } from './TypingStatsSummary';
import type { TypingStatsPayload } from '../types/typingStats';

const sampleStats: TypingStatsPayload = {
  netWpm: 32,
  rawWpm: 35,
  peakWpm: 40,
  wallClockWpm: 28,
  consistency: 4.2,
  flowRatio: 0.75,
  activeSeconds: 180,
  totalSeconds: 240,
  pauseCount: 2,
  burstCount: 3,
  keystrokeCount: 500,
  backspaceCount: 20,
  wordCount: 120,
  timerRemainingSeconds: 312,
  wpmTimeline: [{ t: 60, wpm: 30 }],
  pauses: [{ start: 30, end: 35, durationMs: 5000 }],
  bursts: [{ start: 0, end: 30, avgWpm: 34, wordCount: 20 }],
  keyFrequency: { a: 10 },
};

describe('TypingStatsSummary', () => {
  it('renders peak WPM and flow ratio', () => {
    render(<TypingStatsSummary stats={sampleStats} />);
    expect(screen.getByText('Peak WPM')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('5:12')).toBeInTheDocument();
  });
});
