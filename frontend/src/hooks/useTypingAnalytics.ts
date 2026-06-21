import { useCallback, useRef, useState } from 'react';
import {
  buildSnapshot,
  computeLiveStats,
  createSession,
  recordKeyDown,
  recordPaste,
  recordWordCount,
  type TypingSession,
} from '../lib/typingAnalyticsCore';
import {
  countWords,
  EMPTY_KEY_FREQUENCY,
  type LiveTypingStats,
  type TypingStatsPayload,
} from '../types/typingStats';

const EMPTY_LIVE: LiveTypingStats = {
  netWpm: 0,
  wallClockWpm: 0,
  activeSeconds: 0,
  pauseCount: 0,
  flowRatio: 0,
  currentBurstWpm: 0,
  keyFrequency: EMPTY_KEY_FREQUENCY,
};

export function useTypingAnalytics() {
  const sessionRef = useRef<TypingSession>(createSession(() => Date.now()));
  const [liveStats, setLiveStats] = useState<LiveTypingStats>(EMPTY_LIVE);

  const refreshLive = useCallback(() => {
    setLiveStats(computeLiveStats(sessionRef.current, () => Date.now()));
  }, []);

  const reset = useCallback(() => {
    sessionRef.current = createSession(() => Date.now());
    setLiveStats(EMPTY_LIVE);
  }, []);

  const recordKeyDownEvent = useCallback(
    (key: string) => {
      recordKeyDown(sessionRef.current, key, Date.now());
      refreshLive();
    },
    [refreshLive],
  );

  const recordPasteEvent = useCallback(() => {
    recordPaste(sessionRef.current, Date.now());
    refreshLive();
  }, [refreshLive]);

  const recordTextChange = useCallback(
    (text: string) => {
      recordWordCount(sessionRef.current, countWords(text), Date.now());
      refreshLive();
    },
    [refreshLive],
  );

  const getSnapshot = useCallback((): TypingStatsPayload => {
    return buildSnapshot(sessionRef.current, () => Date.now());
  }, []);

  return {
    liveStats,
    recordKeyDown: recordKeyDownEvent,
    recordPaste: recordPasteEvent,
    recordChange: recordTextChange,
    getSnapshot,
    reset,
  };
}
