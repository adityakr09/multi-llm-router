import os
import time
from groq import Groq
from models import ModelResponse

# Groq pricing (per 1M tokens) — Llama 3.3 70B
GROQ_INPUT_COST_PER_1M = 0.59
GROQ_OUTPUT_COST_PER_1M = 0.79
MODEL_NAME = "llama-3.3-70b-versatile"

def call_groq(query: str) -> ModelResponse:
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        start = time.time()
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": query}],
            max_tokens=1024,
        )
        latency_ms = (time.time() - start) * 1000

        usage = response.usage
        input_tokens = usage.prompt_tokens
        output_tokens = usage.completion_tokens
        total_tokens = usage.total_tokens

        cost = (input_tokens / 1_000_000 * GROQ_INPUT_COST_PER_1M) + \
               (output_tokens / 1_000_000 * GROQ_OUTPUT_COST_PER_1M)

        return ModelResponse(
            model_name=MODEL_NAME,
            provider="Groq",
            response=response.choices[0].message.content,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            cost_usd=round(cost, 6),
            latency_ms=round(latency_ms, 2),
        )
    except Exception as e:
        return ModelResponse(
            model_name=MODEL_NAME,
            provider="Groq",
            response="",
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            cost_usd=0.0,
            latency_ms=0.0,
            error=str(e),
        )
