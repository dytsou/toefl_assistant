import type { TypingStatsPayload } from './types/typingStats';

export interface Question {
  id: number;
  type: string;
  title: string;
  content: string;
}

export interface ErrorLog {
  id: number;
  errorType: string;
  incorrect: string;
  suggestion: string;
  explanation: string | null;
  important: boolean;
}

export interface Revision {
  id: number;
  text: string;
  score: number | null;
  feedback: string | null;
  errorLogs: ErrorLog[];
  typingStats: TypingStatsPayload | null;
  createdAt: string;
}

export interface SubmissionResponse {
  id: number;
  currentText: string;
  revisions: ApiRevision[];
}

interface ApiErrorLog {
  id: number;
  errorType: string;
  incorrect: string;
  suggestion: string;
  explanation: string | null;
  important?: boolean;
}

interface ApiTypingStats {
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
  wpmTimeline: TypingStatsPayload['wpmTimeline'];
  pauses: TypingStatsPayload['pauses'];
  bursts: TypingStatsPayload['bursts'];
  keyFrequency: TypingStatsPayload['keyFrequency'];
}

interface ApiRevision {
  id: number;
  text: string;
  score: number | null;
  feedback: string | null;
  errorLogs?: ApiErrorLog[];
  typingStats?: ApiTypingStats | null;
  createdAt: string;
}

function mapTypingStats(stats: ApiTypingStats | null | undefined): TypingStatsPayload | null {
  if (!stats) return null;
  return {
    netWpm: stats.netWpm,
    rawWpm: stats.rawWpm,
    peakWpm: stats.peakWpm,
    wallClockWpm: stats.wallClockWpm,
    consistency: stats.consistency,
    flowRatio: stats.flowRatio,
    activeSeconds: stats.activeSeconds,
    totalSeconds: stats.totalSeconds,
    pauseCount: stats.pauseCount,
    burstCount: stats.burstCount,
    keystrokeCount: stats.keystrokeCount,
    backspaceCount: stats.backspaceCount,
    wordCount: stats.wordCount,
    wpmTimeline: stats.wpmTimeline ?? [],
    pauses: stats.pauses ?? [],
    bursts: stats.bursts ?? [],
    keyFrequency: stats.keyFrequency ?? {},
  };
}

export function mapRevision(rev: ApiRevision): Revision {
  return {
    id: rev.id,
    text: rev.text,
    score: rev.score,
    feedback: rev.feedback,
    createdAt: rev.createdAt,
    typingStats: mapTypingStats(rev.typingStats),
    errorLogs: (rev.errorLogs ?? []).map((err) => ({
      id: err.id,
      errorType: err.errorType,
      incorrect: err.incorrect,
      suggestion: err.suggestion,
      explanation: err.explanation ?? null,
      important: err.important ?? false,
    })),
  };
}

export function mapRevisions(revisions: ApiRevision[]): Revision[] {
  return revisions.map(mapRevision);
}

export interface TypingStatsRow {
  id: number;
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
  wpmTimeline: TypingStatsPayload['wpmTimeline'];
  pauses: TypingStatsPayload['pauses'];
  bursts: TypingStatsPayload['bursts'];
  keyFrequency: TypingStatsPayload['keyFrequency'];
  createdAt: string;
  revisionId: number;
  question: {
    id: number;
    type: string;
    title: string;
  };
}
