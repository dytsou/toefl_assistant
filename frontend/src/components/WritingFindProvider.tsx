import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { fetchWritingSearch } from "../api/writingSearch";
import { isWritingRoute } from "../lib/navigateToWritingMatch";
import type { WritingSearchMatch } from "../types/writingSearch";
import { WritingFindBar } from "./WritingFindBar";

type WritingFindContextValue = {
  openFind: () => void;
};

const WritingFindContext = createContext<WritingFindContextValue | null>(null);

export function useWritingFind() {
  const context = useContext(WritingFindContext);
  if (!context) {
    throw new Error("useWritingFind must be used within WritingFindProvider");
  }
  return context;
}

type WritingFindProviderProps = {
  children: ReactNode;
};

export function WritingFindProvider({ children }: WritingFindProviderProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<WritingSearchMatch[]>([]);
  const [total, setTotal] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [compact, setCompact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<number | null>(null);
  const writingRoute = isWritingRoute(location.pathname);

  const openFind = useCallback(() => {
    setCompact(false);
    setOpen(true);
  }, []);

  const closeFind = useCallback(() => {
    setOpen(false);
    setCompact(false);
    setQuery("");
    setMatches([]);
    setTotal(0);
    setTruncated(false);
    setActiveMatchIndex(0);
    setError("");
  }, []);

  useEffect(() => {
    if (!writingRoute) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setCompact(false);
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [writingRoute]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setMatches([]);
      setTotal(0);
      setTruncated(false);
      setActiveMatchIndex(0);
      setLoading(false);
      setError("");
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      setLoading(true);
      setError("");
      fetchWritingSearch(trimmed)
        .then((result) => {
          setMatches(result.matches);
          setTotal(result.total);
          setTruncated(result.truncated);
          setActiveMatchIndex(0);
          setCompact(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Search failed. Check that the backend is running.");
          setMatches([]);
          setTotal(0);
          setTruncated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [open, query]);

  const contextValue = useMemo(() => ({ openFind }), [openFind]);

  return (
    <WritingFindContext.Provider value={contextValue}>
      {children}
      {writingRoute && (
        <WritingFindBar
          open={open}
          compact={compact}
          query={query}
          matches={matches}
          activeMatchIndex={activeMatchIndex}
          total={total}
          truncated={truncated}
          loading={loading}
          error={error}
          onQueryChange={(value) => {
            setQuery(value);
            setCompact(false);
          }}
          onClose={closeFind}
          onActiveMatchChange={setActiveMatchIndex}
          onNavigateToMatch={() => setCompact(true)}
          onExpandResults={() => setCompact(false)}
        />
      )}
    </WritingFindContext.Provider>
  );
}
