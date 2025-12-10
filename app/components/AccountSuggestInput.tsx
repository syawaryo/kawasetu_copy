"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAccountSuggestion, AccountSuggestion } from "@/app/hooks/useAccountSuggestion";

interface Props {
  value: string;
  summary: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function AccountSuggestInput({
  value,
  summary,
  onChange,
  placeholder = "科目",
  style,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { suggestions, isLoading } = useAccountSuggestion(summary);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // サジェストがあり、科目が未入力なら自動でドロップダウン表示
  useEffect(() => {
    if (suggestions.length > 0 && !value && isFocused) {
      setShowDropdown(true);
    }
  }, [suggestions, value, isFocused]);

  const handleSelect = (suggestion: AccountSuggestion) => {
    onChange(suggestion.accountTitle);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        style={style}
      />

      {/* サジェストインジケーター */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 14,
            height: 14,
            border: "2px solid #dde5f4",
            borderTopColor: "#0d56c9",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      )}

      {/* サジェストボタン */}
      {!isLoading && suggestions.length > 0 && !showDropdown && (
        <button
          type="button"
          onClick={() => setShowDropdown(true)}
          style={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            padding: "2px 6px",
            fontSize: "0.7rem",
            backgroundColor: "#0d56c9",
            color: "#fff",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          AI
        </button>
      )}

      {/* ドロップダウン */}
      {showDropdown && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "#fff",
            border: "1px solid #dde5f4",
            borderRadius: "0.375rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            marginTop: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "6px 10px",
              fontSize: "0.7rem",
              color: "#686e78",
              backgroundColor: "#f8f9fa",
              borderBottom: "1px solid #dde5f4",
            }}
          >
            AI推測（摘要から）
          </div>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(s)}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 10px",
                textAlign: "left",
                border: "none",
                borderBottom: idx < suggestions.length - 1 ? "1px solid #f0f2f7" : "none",
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f4ff")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#1a1c20" }}>
                  {s.accountTitle}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#fff",
                    backgroundColor: s.score > 0.8 ? "#10b981" : s.score > 0.6 ? "#f59e0b" : "#9ca3af",
                    padding: "2px 6px",
                    borderRadius: "10px",
                  }}
                >
                  {Math.round(s.score * 100)}%
                </span>
              </div>
              {s.description && (
                <div style={{ fontSize: "0.75rem", color: "#686e78", marginTop: 2 }}>
                  {s.description.length > 40 ? s.description.slice(0, 40) + "..." : s.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
