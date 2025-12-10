import { useState, useEffect, useRef } from "react";

export interface AccountSuggestion {
  accountTitle: string;
  description: string;
  score: number;
}

export function useAccountSuggestion(summary: string, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState<AccountSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 2文字未満なら検索しない
    if (!summary || summary.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      // 前のリクエストをキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      try {
        const res = await fetch("/api/suggest-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: summary.trim() }),
          signal: abortControllerRef.current.signal,
        });

        if (res.ok) {
          const data = await res.json();
          // APIレスポンス形式を変換
          const mapped = (data.suggestions || []).map((s: { name: string; description: string; similarity: number }) => ({
            accountTitle: s.name,
            description: s.description || "",
            score: s.similarity / 100, // パーセント → 0-1
          }));
          setSuggestions(mapped);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Suggestion fetch error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [summary, debounceMs]);

  return { suggestions, isLoading };
}
