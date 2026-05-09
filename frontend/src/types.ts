export interface ModelResponse {
  model_name: string;
  provider: string;
  response: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  error?: string;
}

export interface ChatResponse {
  query: string;
  results: ModelResponse[];
  total_cost_usd: number;
  fastest_model: string;
}

export interface ProviderConfig {
  key: string;
  label: string;
  model: string;
  color: string;
  accent: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    key: "groq",
    label: "Groq",
    model: "Llama 3.3 70B",
    color: "#f97316",
    accent: "#431407",
  },
  {
    key: "gemini",
    label: "Gemini",
    model: "Gemini 1.5 Flash",
    color: "#3b82f6",
    accent: "#1e3a5f",
  },
  {
    key: "openai",
    label: "OpenRouter",
    model: "Llama 3.3 70B Free",
    color: "#10b981",
    accent: "#064e3b",
  },
];
