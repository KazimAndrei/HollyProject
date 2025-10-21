"""RAG service for Bible Chat."""
from typing import List, Dict, Optional
from .scripture_service import ScriptureService
from .openai_service import OpenAIService
from .citation_parser import CitationParser


class RAGService:
    """RAG pipeline: retrieve → generate → parse citations."""

    def __init__(self, scripture_service: ScriptureService, openai_service: OpenAIService):
        self.scripture_service = scripture_service
        self.openai_service = openai_service
        self.citation_parser = CitationParser()

    def process_question(
        self,
        question: str,
        locale: str = "en",
        top_k: int = 5
    ) -> Dict:
        """Process user question through RAG pipeline.
        
        Args:
            question: User's question
            locale: Language locale (en/ru)
            top_k: Number of passages to retrieve
            
        Returns:
            {
                "answer": str,
                "citations": [{"ref": str, "text": str, "spans": [...]}],
                "has_reliable_sources": bool
            }
        """
        # Step 1: Retrieve relevant passages
        passages = self.scripture_service.search_verses(question, locale, top_k)
        
        # Step 2: Check if retrieval is reliable (minimum score threshold)
        has_reliable_sources = len(passages) > 0 and passages[0].get("score", 0) >= 2
        
        # Step 3: If no reliable sources, return polite refusal with nearest passages
        if not has_reliable_sources:
            nearest = self.scripture_service.get_nearest_passages(locale, count=3)
            return self._build_refusal_response(question, nearest, locale)
        
        # Step 4: Take top 3 for generation (rerank already done by score)
        top_passages = passages[:3]
        
        # Step 5: Generate answer with citations
        answer = self.openai_service.generate_answer(
            question=question,
            context_passages=top_passages,
            locale=locale
        )
        
        # Step 6: Parse citations from answer
        parsed_citations = self.citation_parser.parse_citations(answer, locale)
        
        # Step 7: Enrich citations with text and spans
        enriched_citations = self._enrich_citations(parsed_citations, locale)
        
        return {
            "answer": answer,
            "citations": enriched_citations,
            "has_reliable_sources": True
        }

    def _build_refusal_response(self, question: str, nearest: List[Dict], locale: str) -> Dict:
        """Build polite refusal response with nearest passages."""
        if locale == "ru":
            answer = (
                f"Извините, я не нашел достоверных источников для вашего вопроса '{question}'. "
                "Возможно, эти отрывки могут помочь:"
            )
        else:
            answer = (
                f"I'm sorry, I couldn't find reliable sources for your question '{question}'. "
                "Perhaps these passages may help:"
            )
        
        citations = []
        for passage in nearest:
            citations.append({
                "ref": passage["ref"],
                "text": passage["text"],
                "spans": []
            })
        
        return {
            "answer": answer,
            "citations": citations,
            "has_reliable_sources": False
        }

    def _enrich_citations(self, parsed_citations: List[Dict], locale: str) -> List[Dict]:
        """Enrich parsed citations with full text and spans."""
        enriched = []
        
        for citation in parsed_citations:
            ref = citation["ref"]
            verse = self.scripture_service.get_verse_by_ref(ref, locale)
            
            if verse:
                enriched.append({
                    "ref": ref,
                    "text": verse["text"],
                    "spans": verse.get("spans", [])
                })
            else:
                # Citation mentioned but not in corpus
                enriched.append({
                    "ref": ref,
                    "text": "(Text not available in corpus)",
                    "spans": []
                })
        
        return enriched
