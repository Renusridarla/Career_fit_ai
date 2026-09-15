import json
import logging
import re
from typing import Dict, Any, Optional, Type
from abc import ABC, abstractmethod
from pydantic import BaseModel
from app.config.settings import settings

logger = logging.getLogger(__name__)

class AbstractAIProvider(ABC):
    @abstractmethod
    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        pass

class GeminiAIProvider(AbstractAIProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
            
            contents = []
            if system_prompt:
                contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION: {system_prompt}"}]})
                contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow these instructions."}]})
            contents.append({"role": "user", "parts": [{"text": prompt}]})

            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, json={"contents": contents})
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                logger.error("Gemini API Error (%d): %s", res.status_code, res.text)
                raise RuntimeError(f"Gemini API returned status code {res.status_code}")
        except Exception as e:
            logger.error("Error in Gemini API call: %s", e)
            raise e

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        json_prompt = f"{prompt}\n\nIMPORTANT: Return ONLY raw, valid JSON. Do not wrap in markdown code blocks like ```json."
        raw_text = await self.generate_text(json_prompt, system_prompt)
        return clean_and_parse_json(raw_text)

class OpenAIProvider(AbstractAIProvider):
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        import httpx
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json={"model": self.model_name, "messages": messages, "temperature": 0.2}
            )
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
            raise RuntimeError(f"OpenAI API error {res.status_code}: {res.text}")

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        raw_text = await self.generate_text(prompt, system_prompt)
        return clean_and_parse_json(raw_text)

class FallbackHeuristicProvider(AbstractAIProvider):
    """
    Fallback provider when no AI API key is configured.
    Extremely clean rule-based structured extraction for resumes and JDs.
    """
    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        return "AI analysis completed using rule-based engine."

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        return {}

def clean_and_parse_json(text: str) -> Dict[str, Any]:
    if not text:
        return {}
    # Remove markdown code fences if present
    cleaned = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'```\s*$', '', cleaned)
    cleaned = cleaned.strip()

    # Find first { and last }
    start_idx = cleaned.find('{')
    end_idx = cleaned.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        cleaned = cleaned[start_idx:end_idx+1]

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error("JSON parsing error on text: %s\nError: %s", cleaned, e)
        raise ValueError(f"Failed to parse JSON response from LLM: {str(e)}")

def get_ai_provider() -> AbstractAIProvider:
    provider_name = settings.AI_PROVIDER.lower()
    api_key = settings.AI_API_KEY

    if provider_name == "gemini" and api_key and api_key.strip():
        return GeminiAIProvider(api_key=api_key.strip(), model_name=settings.AI_MODEL)
    elif provider_name == "openai" and api_key and api_key.strip():
        return OpenAIProvider(api_key=api_key.strip(), model_name=settings.AI_MODEL)
    else:
        logger.info("Using FallbackHeuristicProvider (No valid AI_API_KEY configured)")
        return FallbackHeuristicProvider()

def is_ai_configured() -> bool:
    return bool(settings.AI_API_KEY and settings.AI_API_KEY.strip())
