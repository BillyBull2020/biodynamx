"""
LLM Service - Multi-Provider AI Integration
=========================================
Priority: Ollama (local) → OpenRouter → Groq → Gemini → OpenAI
"""

import os
import json
import requests
from typing import Optional, Dict, Any, List
from flask import current_app


class LLMProvider:
    """Base class for LLM providers"""
    
    def __init__(self, api_key: str = None, base_url: str = None, model: str = None):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
    
    def chat(self, messages: List[Dict], **kwargs) -> Dict[str, Any]:
        """Send chat request - must be implemented by subclasses"""
        raise NotImplementedError
    
    def test_connection(self) -> Dict[str, Any]:
        """Test if provider is available"""
        raise NotImplementedError


class OllamaProvider(LLMProvider):
    """Ollama local provider - FREE"""
    
    def __init__(self, api_key: str = None, base_url: str = None, model: str = "qwen2.5-coder:7b"):
        super().__init__(api_key, base_url, model)
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    def chat(self, messages: List[Dict], **kwargs) -> Dict[str, Any]:
        """Send chat to local Ollama instance"""
        url = f"{self.base_url}/api/chat"
        
        # Convert messages to Ollama format
        formatted_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            formatted_messages.append({"role": role, "content": content})
        
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "stream": False
        }
        
        try:
            response = requests.post(url, json=payload, timeout=120)
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": True,
                "content": data.get("message", {}).get("content", ""),
                "model": data.get("model", self.model),
                "provider": "ollama"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Ollama connection failed: {str(e)}",
                "provider": "ollama"
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Ollama connection"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                models = response.json().get("models", [])
                return {
                    "success": True,
                    "message": f"Ollama connected. Available models: {len(models)}",
                    "models": [m.get("name", "") for m in models[:10]]
                }
            return {"success": False, "error": f"Status: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


class OpenRouterProvider(LLMProvider):
    """OpenRouter provider - supports free tier models"""
    
    def __init__(self, api_key: str, base_url: str = None, model: str = "openai/gpt-4o-mini"):
        super().__init__(api_key, base_url, model)
        self.base_url = "https://openrouter.ai/api/v1"
    
    def chat(self, messages: List[Dict], **kwargs) -> Dict[str, Any]:
        """Send chat via OpenRouter API"""
        if not self.api_key:
            return {"success": False, "error": "OpenRouter API key not configured", "provider": "openrouter"}
        
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://empireos.local",
            "X-Title": "EmpireOS"
        }
        
        # Use model from kwargs or default
        model = kwargs.get("model", self.model)
        
        payload = {
            "model": model,
            "messages": messages
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": True,
                "content": data.get("choices", [{}])[0].get("message", {}).get("content", ""),
                "model": data.get("model", model),
                "provider": "openrouter",
                "usage": data.get("usage", {})
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"OpenRouter error: {str(e)}",
                "provider": "openrouter"
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test OpenRouter connection"""
        if not self.api_key:
            return {"success": False, "error": "API key not configured"}
        
        try:
            # Get available models
            url = "https://openrouter.ai/api/v1/models"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                return {"success": True, "message": "OpenRouter connected successfully"}
            return {"success": False, "error": f"Status: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


class GroqProvider(LLMProvider):
    """Groq provider - free tier available"""
    
    def __init__(self, api_key: str, base_url: str = None, model: str = "llama-3.3-70b-versatile"):
        super().__init__(api_key, base_url, model)
        self.base_url = "https://api.groq.com/openai/v1"
    
    def chat(self, messages: List[Dict], **kwargs) -> Dict[str, Any]:
        """Send chat via Groq API"""
        if not self.api_key:
            return {"success": False, "error": "Groq API key not configured", "provider": "groq"}
        
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        model = kwargs.get("model", self.model)
        
        payload = {
            "model": model,
            "messages": messages
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": True,
                "content": data.get("choices", [{}])[0].get("message", {}).get("content", ""),
                "model": data.get("model", model),
                "provider": "groq"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Groq error: {str(e)}",
                "provider": "groq"
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Groq connection"""
        if not self.api_key:
            return {"success": False, "error": "API key not configured"}
        
        try:
            url = f"{self.base_url}/models"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                return {"success": True, "message": "Groq connected successfully"}
            return {"success": False, "error": f"Status: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


class GeminiProvider(LLMProvider):
    """Google Gemini provider"""
    
    def __init__(self, api_key: str, base_url: str = None, model: str = "gemini-2.0-flash-001"):
        super().__init__(api_key, base_url, model)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
    
    def chat(self, messages: List[Dict], **kwargs) -> Dict[str, Any]:
        """Send chat via Gemini API"""
        if not self.api_key:
            return {"success": False, "error": "Gemini API key not configured", "provider": "gemini"}
        
        model = kwargs.get("model", self.model)
        
        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = msg.get("role", "user")
            if role == "assistant":
                role = "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })
        
        url = f"{self.base_url}/models/{model}:generateContent?key={self.api_key}"
        
        payload = {"contents": contents}
        
        try:
            response = requests.post(url, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            content = ""
            if data.get("candidates"):
                content = data["candidates"][0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            return {
                "success": True,
                "content": content,
                "model": model,
                "provider": "gemini"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Gemini error: {str(e)}",
                "provider": "gemini"
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Gemini connection"""
        if not self.api_key:
            return {"success": False, "error": "API key not configured"}
        
        try:
            url = f"{self.base_url}/models?key={self.api_key}"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                return {"success": True, "message": "Gemini connected successfully"}
            return {"success": False, "error": f"Status: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


class OpenAIProvider(LLMProvider):
    """OpenAI provider - paid"""
    
    def __init__(self, api_key: str, base_url: str = None, model: str = "gpt-4o-mini"):
        super().__init__(api_key, base_url, model)
        self.base_url = "https://api.openai.com/v1"
    
    def chat(self, messages: List[Dict], **kwargs) -> Dict[str, Any]:
        """Send chat via OpenAI API"""
        if not self.api_key:
            return {"success": False, "error": "OpenAI API key not configured", "provider": "openai"}
        
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        model = kwargs.get("model", self.model)
        
        payload = {
            "model": model,
            "messages": messages
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            return {
                "success": True,
                "content": data.get("choices", [{}])[0].get("message", {}).get("content", ""),
                "model": data.get("model", model),
                "provider": "openai"
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"OpenAI error: {str(e)}",
                "provider": "openai"
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test OpenAI connection"""
        if not self.api_key:
            return {"success": False, "error": "API key not configured"}
        
        try:
            url = f"{self.base_url}/models"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                return {"success": True, "message": "OpenAI connected successfully"}
            return {"success": False, "error": f"Status: {response.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# Import the new provider
from backend.services.openhands_provider import OpenHandsCloudProvider

# Provider registry
AVAILABLE_PROVIDERS = {
    "openhands": OpenHandsCloudProvider,
    "ollama": OllamaProvider,
    "openrouter": OpenRouterProvider,
    "groq": GroqProvider,
    "gemini": GeminiProvider,
    "openai": OpenAIProvider
}

# FREE Providers (no API key needed - included with OpenHands Cloud)
# These use the OpenHands Cloud LLM infrastructure

# Model registry with pricing info
AVAILABLE_MODELS = {
    # OpenHands Cloud (FREE with account)
    "openhands": {
        "openhands/claude-sonnet-4-5-20250929": {"name": "Claude Sonnet", "provider": "openhands", "free": True},
        "openhands/claude-3-5-sonnet": {"name": "Claude 3.5 Sonnet", "provider": "openhands", "free": True},
    },
    # Ollama (local - FREE)
    "ollama": {
        "qwen2.5-coder:7b": {"name": "Qwen 2.5 Coder 7B", "provider": "ollama", "free": True},
        "hermes3:latest": {"name": "Hermes 3", "provider": "ollama", "free": True},
        "llama3:latest": {"name": "Llama 3", "provider": "ollama", "free": True},
        "deepseek-coder:latest": {"name": "DeepSeek Coder", "provider": "ollama", "free": True},
    },
    # OpenRouter (has free tier)
    "openrouter": {
        "openai/gpt-4o-mini": {"name": "GPT-4o Mini", "provider": "openrouter", "free": True},
        "google/gemini-2.0-flash-001": {"name": "Gemini 2.0 Flash", "provider": "openrouter", "free": True},
        "meta-llama/llama-3.1-8b-instruct": {"name": "Llama 3.1 8B", "provider": "openrouter", "free": True},
        "anthropic/claude-3.5-sonnet": {"name": "Claude 3.5 Sonnet", "provider": "openrouter", "free": False},
    },
    # Groq (free tier)
    "groq": {
        "llama-3.3-70b-versatile": {"name": "Llama 3.1 70B", "provider": "groq", "free": True},
        "llama-3.1-8b-instant": {"name": "Llama 3.1 8B", "provider": "groq", "free": True},
        "mixtral-8x7b-32768": {"name": "Mixtral 8x7B", "provider": "groq", "free": True},
    },
    # Gemini (has free tier)
    "gemini": {
        "gemini-2.0-flash-001": {"name": "Gemini 2.0 Flash", "provider": "gemini", "free": True},
        "gemini-1.5-flash": {"name": "Gemini 1.5 Flash", "provider": "gemini", "free": True},
        "gemini-pro": {"name": "Gemini Pro", "provider": "gemini", "free": False},
    },
    # OpenAI (paid)
    "openai": {
        "gpt-4o-mini": {"name": "GPT-4o Mini", "provider": "openai", "free": False},
        "gpt-4o": {"name": "GPT-4o", "provider": "openai", "free": False},
        "gpt-3.5-turbo": {"name": "GPT-3.5 Turbo", "provider": "openai", "free": False},
    }
}


def get_provider(provider_name: str = None) -> LLMProvider:
    """Get provider instance based on name"""
    provider_name = provider_name or os.getenv("DEFAULT_PROVIDER", "openhands")
    
    if provider_name == "openhands":
        from backend.services.openhands_provider import OpenHandsCloudProvider
        return OpenHandsCloudProvider(
            api_key=os.getenv("OPENHANDS_API_KEY"),
            model=os.getenv("DEFAULT_MODEL", "openhands/claude-sonnet-4-5-20250929")
        )
    elif provider_name == "ollama":
        return OllamaProvider(
            base_url=os.getenv("OLLAMA_BASE_URL"),
            model=os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")
        )
    elif provider_name == "openrouter":
        return OpenRouterProvider(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            model=os.getenv("DEFAULT_MODEL", "openai/gpt-4o-mini")
        )
    elif provider_name == "groq":
        return GroqProvider(
            api_key=os.getenv("GROQ_API_KEY")
        )
    elif provider_name == "gemini":
        return GeminiProvider(
            api_key=os.getenv("GEMINI_API_KEY")
        )
    elif provider_name == "openai":
        return OpenAIProvider(
            api_key=os.getenv("OPENAI_API_KEY")
        )
    
    # Default to Ollama
    return OllamaProvider()


def get_provider_status() -> Dict[str, Any]:
    """Get status of all configured providers"""
    status = {}
    
    # Check Ollama
    try:
        ollama = OllamaProvider()
        status["ollama"] = ollama.test_connection()
    except:
        status["ollama"] = {"success": False, "error": "Not configured"}
    
    # Check OpenRouter
    if os.getenv("OPENROUTER_API_KEY"):
        try:
            openrouter = OpenRouterProvider(api_key=os.getenv("OPENROUTER_API_KEY"))
            status["openrouter"] = openrouter.test_connection()
        except Exception as e:
            status["openrouter"] = {"success": False, "error": str(e)}
    else:
        status["openrouter"] = {"success": False, "error": "API key not set"}
    
    # Check Groq
    if os.getenv("GROQ_API_KEY"):
        try:
            groq = GroqProvider(api_key=os.getenv("GROQ_API_KEY"))
            status["groq"] = groq.test_connection()
        except Exception as e:
            status["groq"] = {"success": False, "error": str(e)}
    else:
        status["groq"] = {"success": False, "error": "API key not set"}
    
    # Check Gemini
    if os.getenv("GEMINI_API_KEY"):
        try:
            gemini = GeminiProvider(api_key=os.getenv("GEMINI_API_KEY"))
            status["gemini"] = gemini.test_connection()
        except Exception as e:
            status["gemini"] = {"success": False, "error": str(e)}
    else:
        status["gemini"] = {"success": False, "error": "API key not set"}
    
    # Check OpenAI
    if os.getenv("OPENAI_API_KEY"):
        try:
            openai = OpenAIProvider(api_key=os.getenv("OPENAI_API_KEY"))
            status["openai"] = openai.test_connection()
        except Exception as e:
            status["openai"] = {"success": False, "error": str(e)}
    else:
        status["openai"] = {"success": False, "error": "API key not set"}
    
    return status


def chat_with_fallback(messages: List[Dict], preferred_provider: str = None) -> Dict[str, Any]:
    """Chat with automatic fallback to other providers"""
    
    # Provider priority order - OpenHands Cloud is FREE & primary
    priority = ["openhands", "groq", "openrouter", "ollama", "gemini", "openai"]
    
    # If preferred provider specified, try it first
    if preferred_provider:
        priority = [preferred_provider] + [p for p in priority if p != preferred_provider]
    
    errors = []
    
    for provider_name in priority:
        try:
            provider = get_provider(provider_name)
            result = provider.chat(messages)
            
            if result.get("success"):
                return result
            
            errors.append(f"{provider_name}: {result.get('error', 'Unknown error')}")
            
            # Try next provider
            continue
            
        except Exception as e:
            errors.append(f"{provider_name}: {str(e)}")
            continue
    
    # All providers failed
    return {
        "success": False,
        "error": "All providers failed. Errors: " + "; ".join(errors),
        "provider": "none"
    }