<img width="1918" height="893" alt="Demo_1" src="https://github.com/user-attachments/assets/6eecfba4-5caa-4fac-937c-1ce364ee2653" /># ⚡ Multi-LLM Router

> Query **Groq Llama 3**, **Google Gemini**, and **OpenAI GPT-4o Mini** simultaneously — compare responses, track token usage, and measure real-time cost per query.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

**[🚀 Live Demo](your-vercel-url-here)** · **[📖 API Docs](your-railway-url/docs)**

## 🖼️ Screenshots

![Multi-LLM Router Demo](demo2.png)

![Multi-LLM Router UI](demo1.png)

---

## 🧠 What It Does

Most people use one AI at a time. This project routes your query to **3 LLMs simultaneously** and returns:

- **Side-by-side responses** from each model
- **Token usage** (input + output) per model
- **Real cost in USD** per query per model
- **Latency comparison** — which model was fastest
- **Total cost** across all models

This is exactly the architecture powering platforms like **AI Fiesta** — multiple LLMs, one interface.

---

## 🏗️ Architecture

```
User Query
    │
    ▼
Next.js Frontend (Vercel)
    │
    ▼  POST /api/chat
FastAPI Backend (Railway)
    │
    ├──── asyncio.gather() ──── Groq API  (Llama 3.3 70B)
    ├──── concurrent          ─ Gemini API (1.5 Flash)
    └──── execution           ─ OpenAI API (GPT-4o Mini)
    │
    ▼
Aggregated Response
{results, total_cost, fastest_model}
```

**Key design choices:**
- `asyncio.gather()` + `ThreadPoolExecutor` → all 3 APIs called **in parallel**, not sequentially
- Each service is isolated → easy to add new LLMs
- Token costs calculated server-side using official pricing

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, Python 3.11, asyncio |
| LLM SDKs | Groq, google-generativeai, openai |
| Frontend | Next.js 14, TypeScript, React 18 |
| Deployment | Railway (backend), Vercel (frontend) |
| CI/CD | GitHub → Railway auto-deploy on push |

---

## 🚀 Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your API keys to .env

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend `.env`
```
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

| Key | Get it from |
|-----|------------|
| GROQ_API_KEY | [console.groq.com](https://console.groq.com) — Free |
| GEMINI_API_KEY | [aistudio.google.com](https://aistudio.google.com) — Free |
| OPENAI_API_KEY | [platform.openai.com](https://platform.openai.com) — $5 free credit |

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
```

---

## 📦 API Reference

### `POST /api/chat`

```json
// Request
{
  "query": "Explain quantum computing simply",
  "models": ["groq", "gemini", "openai"]
}

// Response
{
  "query": "Explain quantum computing simply",
  "fastest_model": "Groq",
  "total_cost_usd": 0.000023,
  "results": [
    {
      "provider": "Groq",
      "model_name": "llama-3.3-70b-versatile",
      "response": "Quantum computing uses...",
      "input_tokens": 12,
      "output_tokens": 187,
      "total_tokens": 199,
      "cost_usd": 0.000005,
      "latency_ms": 823.4,
      "error": null
    }
    // ... gemini, openai
  ]
}
```

### `GET /api/models`
Returns list of available models.

### `GET /health`
Health check endpoint.

---

## ☁️ Deployment

### Backend → Railway

1. Push code to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Set environment variables in Railway dashboard
4. Railway auto-deploys on every push to `main`

### Frontend → Vercel

1. Push code to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set `NEXT_PUBLIC_API_URL` to your Railway URL
4. Vercel auto-deploys on every push

---

## 💰 Cost Comparison (per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| Groq Llama 3.3 70B | $0.59 | $0.79 |
| Gemini 1.5 Flash | $0.075 | $0.30 |
| GPT-4o Mini | $0.15 | $0.60 |

A typical query costs **~$0.000005 – $0.00005** total across all 3 models.

---

## 🗂️ Project Structure

```
multi-llm-router/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # Pydantic request/response models
│   ├── requirements.txt
│   ├── Procfile             # Railway deployment
│   ├── railway.toml         # Railway config
│   ├── routers/
│   │   └── chat.py          # /api/chat endpoint
│   └── services/
│       ├── groq_service.py
│       ├── gemini_service.py
│       └── openai_service.py
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx     # Main UI
    │   │   └── globals.css
    │   └── types.ts         # TypeScript interfaces
    ├── package.json
    └── next.config.js
```

---

## 👨‍💻 Author

**Aditya Kumar** — AI Application Developer & Backend Engineer

[Portfolio](https://adityakr09-portfolio.netlify.app) · [GitHub](https://github.com/adityakr09) · [LinkedIn](https://linkedin.com/in/aditya-kumar-01)

---

*Built to understand multi-LLM orchestration — the core architecture behind platforms like AI Fiesta.*
