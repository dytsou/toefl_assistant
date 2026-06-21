export interface WpmTimelinePoint {
  t: number;
  wpm: number;
}

export interface PauseSegment {
  start: number;
  end: number;
  durationMs: number;
}

export interface BurstSegment {
  start: number;
  end: number;
  avgWpm: number;
  wordCount: number;
}

export interface TypingStatsPayload {
  netWpm: number;
  rawWpm: number;
  peakWpm: number;
  wallClockWpm: number;
  consistency: number;
  flowRatio: number;
  activeSeconds: number;
  totalSeconds: number;
  pauseCount: number;
  burstCount: number;
  keystrokeCount: number;
  backspaceCount: number;
  wordCount: number;
  wpmTimeline: WpmTimelinePoint[];
  pauses: PauseSegment[];
  bursts: BurstSegment[];
  keyFrequency: Record<string, number>;
}

export interface LiveTypingStats {
  netWpm: number;
  wallClockWpm: number;
  activeSeconds: number;
  pauseCount: number;
  flowRatio: number;
  currentBurstWpm: number;
  keyFrequency: Record<string, number>;
}

export const EMPTY_KEY_FREQUENCY: Record<string, number> = Object.freeze({});

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
