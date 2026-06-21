/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyboardHeatmap } from './KeyboardHeatmap';

describe('KeyboardHeatmap', () => {
  it('shows empty state when no presses recorded', () => {
    render(<KeyboardHeatmap mode="live" data={{}} />);
    expect(screen.getByText('Start typing to see heatmap')).toBeInTheDocument();
  });

  it('renders svg with viewBox for populated data', () => {
    const { container } = render(
      <KeyboardHeatmap mode="session" data={{ a: 10, Backspace: 2, Space: 5 }} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('viewBox')).toContain('640');
  });

  it('exposes aria labels for keys', () => {
    render(<KeyboardHeatmap mode="aggregate" data={{ a: 3 }} />);
    expect(screen.getByLabelText('a: 3 presses')).toBeInTheDocument();
  });
});
