import { z } from "zod";

const wpmTimelinePointSchema = z.object({
  t: z.number(),
  wpm: z.number(),
});

const pauseSegmentSchema = z.object({
  start: z.number(),
  end: z.number(),
  durationMs: z.number(),
});

const burstSegmentSchema = z.object({
  start: z.number(),
  end: z.number(),
  avgWpm: z.number(),
  wordCount: z.number(),
});

export const typingStatsPayloadSchema = z.object({
  netWpm: z.number(),
  rawWpm: z.number(),
  peakWpm: z.number(),
  wallClockWpm: z.number(),
  consistency: z.number(),
  flowRatio: z.number(),
  activeSeconds: z.number().int().nonnegative(),
  totalSeconds: z.number().int().nonnegative(),
  pauseCount: z.number().int().nonnegative(),
  burstCount: z.number().int().nonnegative(),
  keystrokeCount: z.number().int().nonnegative(),
  backspaceCount: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  timerRemainingSeconds: z.number().int().nonnegative(),
  wpmTimeline: z.array(wpmTimelinePointSchema).max(500),
  pauses: z.array(pauseSegmentSchema).max(200),
  bursts: z.array(burstSegmentSchema).max(200),
  keyFrequency: z.record(z.string(), z.number().int().nonnegative()),
});

export type TypingStatsPayload = z.infer<typeof typingStatsPayloadSchema>;

const MAX_SERIALIZED_BYTES = 128 * 1024;

export function parseTypingStatsPayload(
  value: unknown,
): TypingStatsPayload | null {
  const parsed = typingStatsPayloadSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  const serialized = JSON.stringify(parsed.data);
  if (Buffer.byteLength(serialized, "utf8") > MAX_SERIALIZED_BYTES) {
    return null;
  }

  return parsed.data;
}

export function typingStatsCreateInput(stats: TypingStatsPayload) {
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
    timerRemainingSeconds: stats.timerRemainingSeconds,
    wpmTimeline: stats.wpmTimeline,
    pauses: stats.pauses,
    bursts: stats.bursts,
    keyFrequency: stats.keyFrequency,
  };
}
