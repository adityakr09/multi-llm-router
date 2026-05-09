from fastapi import APIRouter
from models import ChatRequest, ChatResponse
from services.groq_service import call_groq
from services.gemini_service import call_gemini
from services.openai_service import call_openai
import asyncio
from concurrent.futures import ThreadPoolExecutor

router = APIRouter()
executor = ThreadPoolExecutor(max_workers=3)

SERVICE_MAP = {
    "groq": call_groq,
    "gemini": call_gemini,
    "openai": call_openai,
}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    loop = asyncio.get_event_loop()

    # Call all selected models concurrently
    tasks = []
    selected = [m for m in request.models if m in SERVICE_MAP]
    for model_key in selected:
        fn = SERVICE_MAP[model_key]
        tasks.append(loop.run_in_executor(executor, fn, request.query))

    results = await asyncio.gather(*tasks)

    total_cost = round(sum(r.cost_usd for r in results), 6)

    # Find fastest successful model
    successful = [r for r in results if not r.error]
    fastest = min(successful, key=lambda r: r.latency_ms).provider if successful else "N/A"

    return ChatResponse(
        query=request.query,
        results=list(results),
        total_cost_usd=total_cost,
        fastest_model=fastest,
    )

@router.get("/models")
def get_models():
    return {
        "available_models": [
            {"key": "groq", "name": "Llama 3.3 70B", "provider": "Groq"},
            {"key": "gemini", "name": "Gemini 1.5 Flash", "provider": "Google"},
            {"key": "openai", "name": "GPT-4o Mini", "provider": "OpenAI"},
        ]
    }
