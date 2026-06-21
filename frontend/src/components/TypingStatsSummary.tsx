import type { TypingStatsPayload } from '../types/typingStats';

interface TypingStatsSummaryProps {
  stats: TypingStatsPayload;
}

export function TypingStatsSummary({ stats }: TypingStatsSummaryProps) {
  return (
    <div className="typing-stats-summary">
      <div className="typing-stats-grid">
        <div className="typing-stat-item">
          <span className="typing-stat-label">Net WPM</span>
          <span className="typing-stat-value">{stats.netWpm}</span>
        </div>
        <div className="typing-stat-item">
          <span className="typing-stat-label">Wall-clock WPM</span>
          <span className="typing-stat-value">{stats.wallClockWpm}</span>
        </div>
        <div className="typing-stat-item">
          <span className="typing-stat-label">Peak WPM</span>
          <span className="typing-stat-value">{stats.peakWpm}</span>
        </div>
        <div className="typing-stat-item">
          <span className="typing-stat-label">Flow ratio</span>
          <span className="typing-stat-value">{Math.round(stats.flowRatio * 100)}%</span>
        </div>
        <div className="typing-stat-item">
          <span className="typing-stat-label">Pauses</span>
          <span className="typing-stat-value">{stats.pauseCount}</span>
        </div>
        <div className="typing-stat-item">
          <span className="typing-stat-label">Active time</span>
          <span className="typing-stat-value">{stats.activeSeconds}s</span>
        </div>
      </div>

      {(stats.pauses.length > 0 || stats.bursts.length > 0) && (
        <div className="typing-segments">
          {stats.pauses.length > 0 && (
            <div>
              <h5 className="typing-segments-title">Pauses</h5>
              <ul className="typing-segments-list">
                {stats.pauses.map((pause, index) => (
                  <li key={`pause-${index}`}>
                    {pause.start}s – {pause.end}s ({Math.round(pause.durationMs / 1000)}s)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stats.bursts.length > 0 && (
            <div>
              <h5 className="typing-segments-title">Bursts</h5>
              <ul className="typing-segments-list">
                {stats.bursts.map((burst, index) => (
                  <li key={`burst-${index}`}>
                    {burst.start}s – {burst.end}s · {Math.round(burst.avgWpm)} WPM · {burst.wordCount}{' '}
                    words
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
