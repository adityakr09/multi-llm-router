"use client";
import { useState } from "react";
import { ChatResponse, ModelResponse, PROVIDERS } from "@/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PROVIDER_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Groq: {
    color: "#f97316",
    bg: "rgba(249,115,22,0.07)",
    border: "rgba(249,115,22,0.25)",
  },
  "Google Gemini": {
    color: "#4f8ef7",
    bg: "rgba(79,142,247,0.07)",
    border: "rgba(79,142,247,0.25)",
  },
  OpenAI: {
    color: "#a855f7",
    bg: "rgba(168,85,247,0.07)",
    border: "rgba(168,85,247,0.25)",
  },
};


function TokenBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: "#8888aa", fontFamily: "'Space Mono', monospace" }}>{label}</span>
        <span style={{ fontSize: 10, color, fontFamily: "'Space Mono', monospace" }}>{value.toLocaleString()}</span>
      </div>
      <div style={{ height: 3, background: "#1e1e2e", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

function ResponseCard({ result, fastest }: { result: ModelResponse; fastest: string }) {
  const style = PROVIDER_STYLES[result.provider] || PROVIDER_STYLES["Groq"];
  const isFastest = result.provider === fastest;
  const hasError = !!result.error;
  const maxTokens = result.total_tokens;

  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 16,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        animation: "fadeUp 0.5s ease forwards",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top glow line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: style.color,
          opacity: 0.8,
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: hasError ? "#ef4444" : style.color,
                display: "inline-block",
                animation: hasError ? "none" : "pulse-dot 2s infinite",
              }}
            />
            <span style={{ fontSize: 16, fontWeight: 700, color: style.color }}>{result.provider}</span>
            {isFastest && !hasError && (
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "'Space Mono', monospace",
                  background: style.color,
                  color: "#000",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                FASTEST
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#8888aa", fontFamily: "'Space Mono', monospace" }}>
            {result.model_name}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: style.color, fontFamily: "'Space Mono', monospace" }}>
            {result.latency_ms > 0 ? `${(result.latency_ms / 1000).toFixed(2)}s` : "—"}
          </div>
          <div style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "'Space Mono', monospace" }}>latency</div>
        </div>
      </div>

      {/* Response */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 10,
          padding: "16px",
          fontSize: 13,
          lineHeight: 1.7,
          color: hasError ? "#ef4444" : "#c8c8e0",
          minHeight: 80,
          fontFamily: hasError ? "'Space Mono', monospace" : "inherit",
          border: "1px solid rgba(255,255,255,0.04)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {hasError ? `Error: ${result.error}` : result.response || "No response"}
      </div>

      {/* Token stats */}
      {!hasError && (
        <div>
          <div style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "'Space Mono', monospace", marginBottom: 8, letterSpacing: 1 }}>
            TOKEN USAGE
          </div>
          <TokenBar label="INPUT" value={result.input_tokens} max={maxTokens} color={style.color} />
          <TokenBar label="OUTPUT" value={result.output_tokens} max={maxTokens} color={style.color} />
        </div>
      )}

      {/* Cost */}
      {!hasError && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: 12,
          }}
        >
          <span style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
            TOTAL TOKENS
          </span>
          <span style={{ fontSize: 11, color: style.color, fontFamily: "'Space Mono', monospace" }}>
            {result.total_tokens.toLocaleString()} tokens
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: style.color,
              fontFamily: "'Space Mono', monospace",
              background: "rgba(0,0,0,0.3)",
              padding: "4px 10px",
              borderRadius: 6,
            }}
          >
            ${result.cost_usd.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}

function LoadingCard({ provider }: { provider: string }) {
  const style = PROVIDER_STYLES[provider] || PROVIDER_STYLES["Groq"];
  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 16,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: style.color }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 20,
            height: 20,
            border: `2px solid ${style.color}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ color: style.color, fontWeight: 700 }}>{provider}</span>
        <span style={{ color: "#4a4a6a", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>thinking...</span>
      </div>
      {[80, 60, 40].map((w, i) => (
        <div
          key={i}
          style={{
            height: 12,
            width: `${w}%`,
            borderRadius: 6,
            background: "linear-gradient(90deg, #1e1e2e 25%, #2a2a3e 50%, #1e1e2e 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedModels, setSelectedModels] = useState(["groq", "gemini", "openai"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const toggleModel = (key: string) => {
    setSelectedModels((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  const handleSubmit = async () => {
    if (!query.trim() || selectedModels.length === 0) return;
    setLoading(true);
    setError("");
    setResult(null);
    if (!history.includes(query.trim())) {
      setHistory((h) => [query.trim(), ...h.slice(0, 4)]);
    }
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), models: selectedModels }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: ChatResponse = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const providerLabels: Record<string, string> = {
    groq: "Groq",
    gemini: "Google Gemini",
    openai: "OpenRouter",
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(30,30,46,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(30,30,46,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Ambient blobs */}
      <div style={{ position: "fixed", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "40%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "10%", left: "30%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,160,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <header style={{ paddingTop: 60, paddingBottom: 48, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 24,
              fontSize: 11,
              fontFamily: "'Space Mono', monospace",
              color: "#8888aa",
              letterSpacing: 1,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3a0", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
            MULTI-LLM ROUTER — COMPARE AI SIDE BY SIDE
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginBottom: 16,
            }}
          >
            One query.
            <br />
            <span style={{ background: "linear-gradient(135deg, #f97316 0%, #4f8ef7 50%, #22d3a0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Three AIs.
            </span>
          </h1>

          <p style={{ color: "#8888aa", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Simultaneously query Groq Llama 3, Gemini Flash & GPT-4o Mini. Compare responses, track tokens, and measure real-time cost.
          </p>
        </header>

        {/* Model selector */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          {PROVIDERS.map((p) => {
            const selected = selectedModels.includes(p.key);
            const s = PROVIDER_STYLES[p.label === "Gemini" ? "Google Gemini" : p.label] || PROVIDER_STYLES["Groq"];
            return (
              <button
                key={p.key}
                onClick={() => toggleModel(p.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 100,
                  border: `1px solid ${selected ? s.color : "#1e1e2e"}`,
                  background: selected ? s.bg : "transparent",
                  color: selected ? s.color : "#4a4a6a",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Syne', sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: selected ? s.color : "#2a2a3e",
                    transition: "background 0.2s",
                  }}
                />
                {p.label}
                <span style={{ fontSize: 10, opacity: 0.6, fontFamily: "'Space Mono', monospace" }}>
                  {p.model}
                </span>
              </button>
            );
          })}
        </div>

        {/* Query input */}
        <div
          style={{
            background: "#0d0d14",
            border: "1px solid #1e1e2e",
            borderRadius: 20,
            padding: "4px 4px 4px 24px",
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            marginBottom: 16,
            transition: "border-color 0.2s",
          }}
          onFocus={() => {}}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask anything — compare how each AI responds..."
            rows={3}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e8e8f0",
              fontSize: 15,
              fontFamily: "'Syne', sans-serif",
              resize: "none",
              paddingTop: 16,
              paddingBottom: 12,
              lineHeight: 1.6,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !query.trim() || selectedModels.length === 0}
            style={{
              background: loading
                ? "#1e1e2e"
                : "linear-gradient(135deg, #f97316, #4f8ef7)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: !query.trim() || selectedModels.length === 0 ? 0.4 : 1,
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Routing...
              </>
            ) : (
              <>Send ↵</>
            )}
          </button>
        </div>

        {/* Quick history */}
        {history.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#4a4a6a", fontFamily: "'Space Mono', monospace", paddingTop: 6 }}>RECENT:</span>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => setQuery(h)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #1e1e2e",
                  borderRadius: 100,
                  padding: "4px 12px",
                  color: "#8888aa",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 200,
                }}
              >
                {h.length > 40 ? h.slice(0, 40) + "…" : h}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, color: "#ef4444", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
            ⚠ {error} — Make sure the backend is running and API keys are set.
          </div>
        )}

        {/* Loading cards */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40 }}>
            {selectedModels.map((key) => (
              <LoadingCard key={key} provider={providerLabels[key]} />
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Summary bar */}
            <div
              style={{
                background: "#0d0d14",
                border: "1px solid #1e1e2e",
                borderRadius: 14,
                padding: "16px 24px",
                display: "flex",
                flexWrap: "wrap",
                gap: 24,
                alignItems: "center",
                marginBottom: 24,
                animation: "fadeUp 0.4s ease",
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 2 }}>TOTAL COST</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#22d3a0", fontFamily: "'Space Mono', monospace" }}>${result.total_cost_usd.toFixed(6)}</div>
              </div>
              <div style={{ width: 1, height: 40, background: "#1e1e2e" }} />
              <div>
                <div style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 2 }}>FASTEST</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f97316" }}>{result.fastest_model}</div>
              </div>
              <div style={{ width: 1, height: 40, background: "#1e1e2e" }} />
              <div>
                <div style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 2 }}>MODELS QUERIED</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#4f8ef7" }}>{result.results.length}</div>
              </div>
              <div style={{ width: 1, height: 40, background: "#1e1e2e" }} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 4 }}>QUERY</div>
                <div style={{ fontSize: 13, color: "#8888aa", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  "{result.query}"
                </div>
              </div>
            </div>

            {/* Response cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 60 }}>
              {result.results.map((r) => (
                <ResponseCard key={r.provider} result={r} fastest={result.fastest_model} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{ textAlign: "center", padding: "60px 0 80px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
            <div style={{ color: "#4a4a6a", fontSize: 14, fontFamily: "'Space Mono', monospace" }}>
              Ask a question above to compare AI responses
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              {["Explain quantum computing simply", "Write a Python quicksort", "What is RAG in AI?", "Best practices for REST APIs"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid #1e1e2e",
                    borderRadius: 100,
                    padding: "8px 16px",
                    color: "#8888aa",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Syne', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{ borderTop: "1px solid #1e1e2e", paddingTop: 24, paddingBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 11, color: "#4a4a6a", fontFamily: "'Space Mono', monospace" }}>
            Built by{" "}
            <a href="https://adityakr09-portfolio.netlify.app" target="_blank" rel="noopener noreferrer" style={{ color: "#8888aa", textDecoration: "none" }}>
              Aditya Kumar
            </a>
            {" "}· Multi-LLM Router
          </div>
          <div style={{ fontSize: 11, color: "#4a4a6a", fontFamily: "'Space Mono', monospace" }}>
            Groq · Gemini · OpenAI — Simultaneously
          </div>
        </footer>
      </div>
    </main>
  );
}
