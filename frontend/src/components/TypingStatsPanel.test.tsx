/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TypingStatsPanel } from './TypingStatsPanel';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockRows = [
  {
    id: 1,
    netWpm: 30,
    rawWpm: 32,
    peakWpm: 35,
    wallClockWpm: 28,
    consistency: 3,
    flowRatio: 0.8,
    activeSeconds: 200,
    totalSeconds: 250,
    pauseCount: 1,
    burstCount: 2,
    keystrokeCount: 400,
    backspaceCount: 10,
    wordCount: 100,
    wpmTimeline: [],
    pauses: [],
    bursts: [],
    keyFrequency: { a: 5 },
    createdAt: '2026-01-01T12:00:00.000Z',
    revisionId: 1,
    question: { id: 1, type: 'Email', title: 'Campus Email' },
  },
  {
    id: 2,
    netWpm: 35,
    rawWpm: 37,
    peakWpm: 40,
    wallClockWpm: 33,
    consistency: 2,
    flowRatio: 0.85,
    activeSeconds: 220,
    totalSeconds: 260,
    pauseCount: 0,
    burstCount: 1,
    keystrokeCount: 450,
    backspaceCount: 8,
    wordCount: 120,
    wpmTimeline: [],
    pauses: [],
    bursts: [],
    keyFrequency: { b: 3 },
    createdAt: '2026-01-02T12:00:00.000Z',
    revisionId: 2,
    question: { id: 2, type: 'Academic', title: 'Lecture Discussion' },
  },
];

describe('TypingStatsPanel', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows empty state when no sessions exist', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <TypingStatsPanel />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/No typing sessions yet/i)).toBeInTheDocument();
  });

  it('filters sessions by question type', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockRows });

    render(
      <MemoryRouter>
        <TypingStatsPanel />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Campus Email')).toBeInTheDocument();
      expect(screen.getByText('Lecture Discussion')).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'Email' }).click();

    await waitFor(() => {
      expect(screen.getByText('Campus Email')).toBeInTheDocument();
      expect(screen.queryByText('Lecture Discussion')).not.toBeInTheDocument();
    });
  });
});
