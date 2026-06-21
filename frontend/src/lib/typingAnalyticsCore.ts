import type {
  BurstSegment,
  LiveTypingStats,
  PauseSegment,
  TypingStatsPayload,
  WpmTimelinePoint,
} from '../types/typingStats';

export const PAUSE_THRESHOLD_MS = 3000;
const TIMELINE_INTERVAL_MS = 5000;

export type NowFn = () => number;

export interface TypingSession {
  startedAt: number;
  lastEventAt: number | null;
  keystrokeCount: number;
  backspaceCount: number;
  wordCount: number;
  wordCountAtBurstStart: number;
  pauseCount: number;
  activeMs: number;
  keyFrequency: Record<string, number>;
  pauses: PauseSegment[];
  bursts: BurstSegment[];
  currentBurstStartMs: number;
  burstWordStart: number;
}

export function createSession(now: NowFn): TypingSession {
  const t = now();
  return {
    startedAt: t,
    lastEventAt: null,
    keystrokeCount: 0,
    backspaceCount: 0,
    wordCount: 0,
    wordCountAtBurstStart: 0,
    pauseCount: 0,
    activeMs: 0,
    keyFrequency: {},
    pauses: [],
    bursts: [],
    currentBurstStartMs: t,
    burstWordStart: 0,
  };
}

function bumpKey(session: TypingSession, key: string) {
  session.keyFrequency[key] = (session.keyFrequency[key] ?? 0) + 1;
}

function closeBurst(session: TypingSession, endMs: number) {
  const durationMin = Math.max((endMs - session.currentBurstStartMs) / 60000, 1 / 60000);
  const words = Math.max(session.wordCount - session.burstWordStart, 0);
  if (words === 0 && session.keystrokeCount === 0) return;

  session.bursts.push({
    start: Math.round((session.currentBurstStartMs - session.startedAt) / 1000),
    end: Math.round((endMs - session.startedAt) / 1000),
    avgWpm: words / durationMin,
    wordCount: words,
  });
}

function startNewBurst(session: TypingSession, atMs: number) {
  session.currentBurstStartMs = atMs;
  session.burstWordStart = session.wordCount;
}

function registerGap(session: TypingSession, atMs: number) {
  if (session.lastEventAt === null) return;

  const gap = atMs - session.lastEventAt;
  if (gap > PAUSE_THRESHOLD_MS) {
    session.pauseCount += 1;
    session.pauses.push({
      start: Math.round((session.lastEventAt - session.startedAt) / 1000),
      end: Math.round((atMs - session.startedAt) / 1000),
      durationMs: gap,
    });
    closeBurst(session, session.lastEventAt);
    startNewBurst(session, atMs);
  } else if (gap > 0) {
    session.activeMs += gap;
  }
}

function normalizeKey(key: string): string {
  if (key === ' ') return 'Space';
  if (key.length === 1) return key.toLowerCase();
  return key;
}

export function recordKeyDown(session: TypingSession, key: string, atMs: number) {
  registerGap(session, atMs);
  const normalized = normalizeKey(key);
  session.keystrokeCount += 1;
  if (normalized === 'Backspace' || normalized === 'Delete') {
    session.backspaceCount += 1;
  }
  bumpKey(session, normalized);
  session.lastEventAt = atMs;
}

export function recordPaste(session: TypingSession, atMs: number) {
  registerGap(session, atMs);
  bumpKey(session, 'Paste');
  session.lastEventAt = atMs;
}

export function recordWordCount(session: TypingSession, wordCount: number, atMs: number) {
  session.wordCount = wordCount;
  if (session.lastEventAt === null) {
    session.lastEventAt = atMs;
  }
}

function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function buildTimeline(session: TypingSession, nowMs: number): WpmTimelinePoint[] {
  const totalMs = Math.max(nowMs - session.startedAt, 0);
  if (totalMs === 0) return [];

  const points: WpmTimelinePoint[] = [];
  for (let windowEnd = TIMELINE_INTERVAL_MS; windowEnd <= totalMs; windowEnd += TIMELINE_INTERVAL_MS) {
    const windowStart = windowEnd - TIMELINE_INTERVAL_MS;
    const activeInWindow = Math.min(session.activeMs, windowEnd) - Math.min(session.activeMs, windowStart);
    const activeMin = Math.max(activeInWindow, 0) / 60000;
    const wpm = activeMin > 0 ? session.wordCount / activeMin : 0;
    points.push({ t: Math.round(windowEnd / 1000), wpm: Math.round(wpm * 10) / 10 });
  }

  if (points.length === 0 && session.wordCount > 0) {
    const activeMin = Math.max(session.activeMs, 1) / 60000;
    points.push({
      t: Math.round(totalMs / 1000),
      wpm: Math.round((session.wordCount / activeMin) * 10) / 10,
    });
  }

  return points;
}

function computeWpm(wordCount: number, activeMs: number, keystrokes: number) {
  const activeMin = Math.max(activeMs, 0) / 60000;
  if (activeMin <= 0) {
    return { netWpm: 0, rawWpm: 0 };
  }
  return {
    netWpm: wordCount / activeMin,
    rawWpm: keystrokes / 5 / activeMin,
  };
}

export function computeLiveStats(session: TypingSession, now: NowFn): LiveTypingStats {
  const nowMs = now();
  const totalMs = Math.max(nowMs - session.startedAt, 0);
  const totalSeconds = Math.round(totalMs / 1000);
  const activeSeconds = Math.round(session.activeMs / 1000);
  const { netWpm, rawWpm: _raw } = computeWpm(
    session.wordCount,
    session.activeMs,
    session.keystrokeCount,
  );
  const totalMin = Math.max(totalMs, 1) / 60000;
  const wallClockWpm = session.wordCount / totalMin;
  const burstDurationMin = Math.max((nowMs - session.currentBurstStartMs) / 60000, 1 / 60000);
  const burstWords = Math.max(session.wordCount - session.burstWordStart, 0);

  return {
    netWpm: Math.round(netWpm * 10) / 10,
    wallClockWpm: Math.round(wallClockWpm * 10) / 10,
    activeSeconds,
    pauseCount: session.pauseCount,
    flowRatio: totalSeconds > 0 ? Math.round((activeSeconds / totalSeconds) * 100) / 100 : 0,
    currentBurstWpm: Math.round((burstWords / burstDurationMin) * 10) / 10,
    keyFrequency: { ...session.keyFrequency },
  };
}

export function buildSnapshot(session: TypingSession, now: NowFn): TypingStatsPayload {
  const nowMs = now();
  const totalMs = Math.max(nowMs - session.startedAt, 0);
  const totalSeconds = Math.round(totalMs / 1000);
  const activeSeconds = Math.round(session.activeMs / 1000);

  closeBurst(session, nowMs);

  const { netWpm, rawWpm } = computeWpm(
    session.wordCount,
    session.activeMs,
    session.keystrokeCount,
  );
  const totalMin = Math.max(totalMs, 1) / 60000;
  const wallClockWpm = session.wordCount / totalMin;
  const wpmTimeline = buildTimeline(session, nowMs);
  const peakWpm =
    wpmTimeline.length > 0 ? Math.max(...wpmTimeline.map((p) => p.wpm)) : netWpm;

  return {
    netWpm: Math.round(netWpm * 10) / 10,
    rawWpm: Math.round(rawWpm * 10) / 10,
    peakWpm: Math.round(peakWpm * 10) / 10,
    wallClockWpm: Math.round(wallClockWpm * 10) / 10,
    consistency: Math.round(stdDev(wpmTimeline.map((p) => p.wpm)) * 10) / 10,
    flowRatio: totalSeconds > 0 ? Math.round((activeSeconds / totalSeconds) * 100) / 100 : 0,
    activeSeconds,
    totalSeconds,
    pauseCount: session.pauseCount,
    burstCount: Math.max(session.bursts.length, session.pauseCount > 0 ? session.pauseCount + 1 : session.keystrokeCount > 0 ? 1 : 0),
    keystrokeCount: session.keystrokeCount,
    backspaceCount: session.backspaceCount,
    wordCount: session.wordCount,
    wpmTimeline,
    pauses: [...session.pauses],
    bursts: [...session.bursts],
    keyFrequency: { ...session.keyFrequency },
  };
}
