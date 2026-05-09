import os
import time
from openai import OpenAI
from models import ModelResponse

# OpenRouter pricing (per 1M tokens) — Llama 3.3 70B Free
OPENROUTER_INPUT_COST_PER_1M = 0.0
OPENROUTER_OUTPUT_COST_PER_1M = 0.0
MODEL_NAME = "meta-llama/llama-3.3-70b-instruct:free"

def call_openai(query: str) -> ModelResponse:
    try:
        client = OpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1",
        )
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

        return ModelResponse(
            model_name=MODEL_NAME,
            provider="OpenRouter",
            response=response.choices[0].message.content,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            cost_usd=0.0,
            latency_ms=round(latency_ms, 2),
        )
    except Exception as e:
        return ModelResponse(
            model_name=MODEL_NAME,
            provider="OpenRouter",
            response="",
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            cost_usd=0.0,
            latency_ms=0.0,
            error=str(e),
        )