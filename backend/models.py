from pydantic import BaseModel
from pydantic import ConfigDict
from typing import Optional

class ChatRequest(BaseModel):
    query: str
    models: Optional[list[str]] = ["groq", "gemini", "openai"]

class ModelResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_name: str
    provider: str
    response: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost_usd: float
    latency_ms: float
    error: Optional[str] = None

class ChatResponse(BaseModel):
    query: str
    results: list[ModelResponse]
    total_cost_usd: float
    fastest_model: str
