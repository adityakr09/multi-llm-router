from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat

app = FastAPI(
    title="Multi-LLM Router API",
    description="Routes queries to multiple LLMs simultaneously and tracks token usage & cost",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.get("/")
def root():
    return {"status": "Multi-LLM Router is live 🚀", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}
