import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BookOpen,
  Keyboard,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api';
import type { TypingStatsRow } from '../types';

const QUESTION_TYPES = ['All', 'Email', 'Academic'] as const;
type QuestionTypeFilter = (typeof QUESTION_TYPES)[number];

const Analytics = () => {
  const [rows, setRows] = useState<TypingStatsRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestionTypeFilter>('All');

  useEffect(() => {
    setIsLoading(true);
    api
      .get<TypingStatsRow[]>('/typing-stats')
      .then((res) => setRows(res.data))
      .catch((err) => {
        console.error(err);
        setLoadError('Could not load typing analytics.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    if (typeFilter === 'All') return rows;
    return rows.filter((row) => row.question.type === typeFilter);
  }, [rows, typeFilter]);

  const trendData = useMemo(
    () =>
      [...filteredRows]
        .reverse()
        .map((row, index) => ({
          index: index + 1,
          label: row.question.title,
          netWpm: row.netWpm,
          createdAt: new Date(row.createdAt).toLocaleDateString(),
        })),
    [filteredRows],
  );

  const avgNetWpm =
    filteredRows.length > 0
      ? Math.round(
          (filteredRows.reduce((sum, row) => sum + row.netWpm, 0) / filteredRows.length) * 10,
        ) / 10
      : 0;

  const avgFlow =
    filteredRows.length > 0
      ? Math.round(
          (filteredRows.reduce((sum, row) => sum + row.flowRatio, 0) / filteredRows.length) *
            100,
        )
      : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (loadError) {
    return <div className="empty-state">{loadError}</div>;
  }

  return (
    <div className="animate-fade analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="text-primary" />
            Typing Analytics
          </h1>
          <p className="text-muted">
            Track WPM trends and flow ratio across practice sessions.
          </p>
        </div>
        <div className="analytics-filters">
          {QUESTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`analytics-filter-pill ${typeFilter === type ? 'is-active' : ''}`}
              onClick={() => setTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state analytics-empty">
          <Keyboard size={40} className="text-primary mb-4" />
          <p>No typing sessions yet — complete a practice and SAVE &amp; GRADE.</p>
          <Link to="/" className="btn-cta analytics-empty-cta">
            Go to Writing Dashboard
          </Link>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="empty-state">
          No {typeFilter} sessions yet.
        </div>
      ) : (
        <>
          <div className="analytics-summary-grid">
            <div className="card analytics-summary-card">
              <Activity size={20} className="text-primary" />
              <span className="analytics-summary-label">Sessions</span>
              <strong>{filteredRows.length}</strong>
            </div>
            <div className="card analytics-summary-card">
              <TrendingUp size={20} className="text-primary" />
              <span className="analytics-summary-label">Avg net WPM</span>
              <strong>{avgNetWpm}</strong>
            </div>
            <div className="card analytics-summary-card">
              <BookOpen size={20} className="text-primary" />
              <span className="analytics-summary-label">Avg flow</span>
              <strong>{avgFlow}%</strong>
            </div>
          </div>

          <div className="card analytics-chart-card">
            <h2 className="text-lg font-bold mb-4">Net WPM trend</h2>
            <div role="img" aria-label="Net WPM trend chart">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData}>
                  <XAxis dataKey="index" label={{ value: 'Session', position: 'insideBottom' }} />
                  <YAxis label={{ value: 'Net WPM', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value) => [`${value ?? 0} WPM`, 'Net WPM']}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.label ?? 'Session'
                    }
                  />
                  <Line type="monotone" dataKey="netWpm" stroke="var(--color-primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold mb-4">Recent sessions</h2>
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Net WPM</th>
                    <th>Peak WPM</th>
                    <th>Flow</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.question.title}</td>
                      <td>{row.question.type}</td>
                      <td>{row.netWpm}</td>
                      <td>{row.peakWpm}</td>
                      <td>{Math.round(row.flowRatio * 100)}%</td>
                      <td>{new Date(row.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
