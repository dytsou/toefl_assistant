/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypingAnalytics } from './useTypingAnalytics';

describe('useTypingAnalytics', () => {
  it('resets live stats after reset()', () => {
    const { result } = renderHook(() => useTypingAnalytics());

    act(() => {
      result.current.recordKeyDown('a');
      result.current.recordChange('hello world');
    });

    expect(result.current.liveStats.keyFrequency.a).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.liveStats.netWpm).toBe(0);
    expect(result.current.liveStats.keyFrequency).toEqual({});
  });

  it('getSnapshot returns payload shape', () => {
    const { result } = renderHook(() => useTypingAnalytics());

    act(() => {
      result.current.recordKeyDown('a');
      result.current.recordChange('test');
    });

    const snapshot = result.current.getSnapshot();
    expect(snapshot.wordCount).toBe(1);
    expect(snapshot.keystrokeCount).toBe(1);
    expect(snapshot.keyFrequency.a).toBe(1);
  });
});
