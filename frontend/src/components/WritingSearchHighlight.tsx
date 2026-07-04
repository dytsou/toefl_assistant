type WritingSearchHighlightProps = {
  text: string;
  start: number;
  end: number;
};

export function WritingSearchHighlight({
  text,
  start,
  end,
}: WritingSearchHighlightProps) {
  const safeStart = Math.max(0, Math.min(start, text.length));
  const safeEnd = Math.max(safeStart, Math.min(end, text.length));

  return (
    <div className="writing-search-highlight card" data-testid="writing-search-highlight">
      <p className="writing-search-highlight-label">Found in this revision</p>
      <p className="writing-search-highlight-text">
        {text.slice(0, safeStart)}
        <mark>{text.slice(safeStart, safeEnd)}</mark>
        {text.slice(safeEnd)}
      </p>
    </div>
  );
}
