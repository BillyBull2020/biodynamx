# EmpireOS - Production-Ready AI Business Command Center

## Quick Start

1. Copy `.env.example` to `.env` and add your API keys
2. Run: `python3 run.py`
3. Open http://localhost:5000

## LLM Provider Setup (Priority Order)

### 1. Ollama (Local Fallback - FREE)
- Install: https://ollama.com/download
- Run: `ollama serve`
- Default model: `qwen2.5-coder:7b`
- No API key needed

### 2. OpenRouter (Primary - Free Tier Available)
- Get key: https://openrouter.ai/settings/keys
- Free models: `openai/gpt-4o-mini`, `google/gemini-2.0-flash-001`, `meta-llama/llama-3.1-8b-instruct`
-.env: `OPENROUTER_API_KEY=your-key`

### 3. Groq (Optional - Free Tier)
- Get key: https://console.groq.com/api-keys
- Free model: `llama-3.1-70b-versatile`
- .env: `GROQ_API_KEY=your-key`

### 4. Gemini (Optional)
- Get key: https://aistudio.google.com/app/apikey
- .env: `GEMINI_API_KEY=your-key`

### 5. OpenAI (Optional - Paid)
- Get key: https://platform.openai.com/api-keys
- .env: `OPENAI_API_KEY=your-key`

## Environment Variables

```bash
# Required for OpenRouter
OPENROUTER_API_KEY=

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:7b

# Optional Providers
GROQ_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=

# App Settings
FLASK_SECRET_KEY=change-me-in-production
DEFAULT_PROVIDER=ollama
DEFAULT_MODEL=qwen2.5-coder:7b
```

## Running the App

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python3 run.py

# Run with custom port
PORT=3000 python3 run.py
```

## Project Structure

- `/backend` - Flask API server
- `/frontend` - HTML/JS dashboard
- `/database` - SQLite database
- `/models` - Data models
- `/services` - LLM and business services

## Tech Stack

- Backend: Python, Flask, SQLite
- Frontend: HTML, CSS, JavaScript
- LLM: OpenRouter, Ollama, Groq, Gemini, OpenAI

## License

Proprietary - AI Expert Solutions / BioDynamX