import os
import time
import google.generativeai as genai
from models import ModelResponse

# Gemini 1.5 Flash pricing (per 1M tokens)
GEMINI_INPUT_COST_PER_1M = 0.075
GEMINI_OUTPUT_COST_PER_1M = 0.30
MODEL_NAME = "gemini-1.5-flash"

def call_gemini(query: str) -> ModelResponse:
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel(MODEL_NAME)

        start = time.time()
        response = model.generate_content(query)
        latency_ms = (time.time() - start) * 1000

        # Extract token counts
        usage = response.usage_metadata
        input_tokens = usage.prompt_token_count
        output_tokens = usage.candidates_token_count
        total_tokens = usage.total_token_count

        cost = (input_tokens / 1_000_000 * GEMINI_INPUT_COST_PER_1M) + \
               (output_tokens / 1_000_000 * GEMINI_OUTPUT_COST_PER_1M)

        return ModelResponse(
            model_name=MODEL_NAME,
            provider="Google Gemini",
            response=response.text,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            cost_usd=round(cost, 6),
            latency_ms=round(latency_ms, 2),
        )
    except Exception as e:
        return ModelResponse(
            model_name=MODEL_NAME,
            provider="Google Gemini",
            response="",
            input_tokens=0,
            output_tokens=0,
            total_tokens=0,
            cost_usd=0.0,
            latency_ms=0.0,
            error=str(e),
        )
