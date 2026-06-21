import { describe, expect, it } from 'vitest';
import {
  PAUSE_THRESHOLD_MS,
  createSession,
  recordKeyDown,
  recordPaste,
  recordWordCount,
  buildSnapshot,
  computeLiveStats,
} from './typingAnalyticsCore';

describe('typingAnalyticsCore', () => {
  it('counts pauses when gap exceeds threshold', () => {
    let now = 0;
    let session = createSession(() => now);

    recordKeyDown(session, 'h', now);
    now += 1000;
    recordKeyDown(session, 'e', now);
    now += 4000;
    recordKeyDown(session, 'y', now);
    recordWordCount(session, 1, now);

    const snapshot = buildSnapshot(session, () => now);
    expect(snapshot.pauseCount).toBe(1);
    expect(snapshot.burstCount).toBeGreaterThanOrEqual(2);
  });

  it('does not count pause within threshold', () => {
    let now = 0;
    let session = createSession(() => now);

    recordKeyDown(session, 'a', now);
    now += 2000;
    recordKeyDown(session, 'b', now);

    const snapshot = buildSnapshot(session, () => now);
    expect(snapshot.pauseCount).toBe(0);
  });

  it('tracks backspace and key frequency', () => {
    let now = 0;
    let session = createSession(() => now);

    for (let i = 0; i < 10; i += 1) {
      recordKeyDown(session, 'Backspace', now);
      now += 50;
    }

    const snapshot = buildSnapshot(session, () => now);
    expect(snapshot.backspaceCount).toBe(10);
    expect(snapshot.keyFrequency.Backspace).toBe(10);
  });

  it('tracks letter key frequency', () => {
    let now = 0;
    let session = createSession(() => now);

    for (let i = 0; i < 5; i += 1) {
      recordKeyDown(session, 'a', now);
      now += 100;
    }

    expect(session.keyFrequency.a).toBe(5);
  });

  it('resets via fresh session', () => {
    let now = 0;
    let session = createSession(() => now);
    recordKeyDown(session, 'a', now);
    session = createSession(() => now);

    const snapshot = buildSnapshot(session, () => now);
    expect(snapshot.netWpm).toBe(0);
    expect(snapshot.keyFrequency).toEqual({});
  });

  it('returns empty snapshot for no activity', () => {
    const session = createSession(() => 0);
    const snapshot = buildSnapshot(session, () => 0);
    expect(snapshot.netWpm).toBe(0);
    expect(snapshot.wpmTimeline).toEqual([]);
    expect(snapshot.keyFrequency).toEqual({});
  });

  it('includes paste in keyFrequency', () => {
    let now = 0;
    let session = createSession(() => now);
    recordPaste(session, now);
    recordWordCount(session, 12, now);

    expect(session.keyFrequency.Paste).toBe(1);
  });

  it('computes peakWpm from timeline', () => {
    let now = 0;
    let session = createSession(() => now);

    for (let i = 0; i < 20; i += 1) {
      recordKeyDown(session, 'a', now);
      recordWordCount(session, i + 1, now);
      now += 200;
    }
    now = 6000;
    recordWordCount(session, 20, now);

    const snapshot = buildSnapshot(session, () => now);
    expect(snapshot.peakWpm).toBeGreaterThan(0);
    expect(snapshot.wpmTimeline.length).toBeGreaterThan(0);
  });

  it('computeLiveStats reflects activity', () => {
    let now = 0;
    let session = createSession(() => now);
    recordKeyDown(session, 'a', now);
    recordWordCount(session, 5, now);
    now += 3000;

    const live = computeLiveStats(session, () => now);
    expect(live.activeSeconds).toBeGreaterThanOrEqual(0);
    expect(live.keyFrequency.a).toBe(1);
  });

  it('exports pause threshold constant', () => {
    expect(PAUSE_THRESHOLD_MS).toBe(3000);
  });
});
