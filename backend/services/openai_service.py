"""OpenAI service wrapper using Emergent LLM key."""
import os
from typing import List, Dict, Optional
from openai import OpenAI


class OpenAIService:
    """Service for OpenAI API calls with Emergent LLM key."""

    SYSTEM_MESSAGE = (
        "You are a pastoral assistant. Always ground answers in the Bible. "
        "ALWAYS provide verse citations (Book Chapter:Verse). "
        "If retrieval is weak, politely refuse and show the nearest passages. "
        "Be respectful and concise. No doctrinal verdicts."
    )

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("EMERGENT_LLM_KEY")
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://llm.emergentagi.com/v1"
        )

    def generate_answer(
        self,
        question: str,
        context_passages: List[Dict],
        locale: str = "en",
        temperature: float = 0.2,
        top_p: float = 0.9,
        max_tokens: int = 600
    ) -> str:
        """Generate pastoral answer with citations.
        
        Args:
            question: User's question
            context_passages: List of relevant Bible passages
            locale: Language locale (en/ru)
            temperature: Generation temperature
            top_p: Top-p sampling
            max_tokens: Max tokens to generate
            
        Returns:
            Generated answer text with citations
        """
        # Build context from passages
        context = self._build_context(context_passages, locale)
        
        # Build user prompt
        if locale == "ru":
            user_prompt = f"""Вопрос: {question}

Контекст из Библии:
{context}

Ответь на вопрос, используя приведенные стихи. ОБЯЗАТЕЛЬНО укажи ссылки на стихи в формате (Книга Глава:Стих).
Если контекст слабый или не релевантен, вежливо откажи и предложи ближайшие отрывки."""
        else:
            user_prompt = f"""Question: {question}

Bible Context:
{context}

Answer the question using the provided verses. ALWAYS include verse citations in format (Book Chapter:Verse).
If context is weak or irrelevant, politely refuse and suggest nearest passages."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self.SYSTEM_MESSAGE},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            return self._fallback_response(locale, str(e))

    def _build_context(self, passages: List[Dict], locale: str) -> str:
        """Build context string from passages."""
        if not passages:
            return "No relevant passages found."
        
        context_lines = []
        for p in passages:
            ref = p.get("ref", "Unknown")
            text = p.get("text", "")
            context_lines.append(f"{ref}: {text}")
        
        return "\n\n".join(context_lines)

    def _fallback_response(self, locale: str, error: str) -> str:
        """Fallback response when API fails."""
        if locale == "ru":
            return f"Извините, я не могу сейчас ответить. Пожалуйста, попробуйте позже. (Ошибка: {error})"
        else:
            return f"I'm sorry, I cannot answer right now. Please try again later. (Error: {error})"
