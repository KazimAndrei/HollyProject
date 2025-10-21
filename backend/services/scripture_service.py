"""Scripture service for loading and searching Bible corpus."""
import json
import os
from typing import List, Dict, Optional
import re


class ScriptureService:
    """Service for loading and searching scripture corpus."""

    def __init__(self, corpus_dir: str = "corpus"):
        self.corpus_dir = corpus_dir
        self.manifest = self._load_manifest()
        self.translations = {}  # {lang: {ref: verse}}
        self._load_all_translations()

    def _load_manifest(self) -> Dict:
        """Load corpus manifest."""
        manifest_path = os.path.join(self.corpus_dir, "manifest.json")
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _load_all_translations(self):
        """Load all translations from manifest."""
        for trans in self.manifest["translations"]:
            lang = trans["lang"]
            path = os.path.join(self.corpus_dir, trans["path"].replace("corpus/", ""))
            
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.translations[lang] = {
                    verse["ref"]: verse for verse in data["verses"]
                }

    def get_verse_by_ref(self, ref: str, locale: str = "en") -> Optional[Dict]:
        """Get verse by reference (e.g., 'John 3:16')."""
        if locale not in self.translations:
            locale = "en"  # fallback
        
        return self.translations[locale].get(ref)

    def search_verses(self, query: str, locale: str = "en", top_k: int = 5) -> List[Dict]:
        """Simple keyword search in verses."""
        if locale not in self.translations:
            locale = "en"
        
        query_lower = query.lower()
        query_words = set(re.findall(r'\w+', query_lower))
        
        results = []
        for ref, verse in self.translations[locale].items():
            text_lower = verse["text"].lower()
            text_words = set(re.findall(r'\w+', text_lower))
            
            # Calculate simple word overlap score
            overlap = len(query_words & text_words)
            if overlap > 0:
                results.append({
                    **verse,
                    "score": overlap,
                    "spans": self._find_spans(query_words, verse["text"])
                })
        
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def _find_spans(self, query_words: set, text: str) -> List[Dict[str, int]]:
        """Find character spans of matching words in text."""
        spans = []
        text_lower = text.lower()
        
        for word in query_words:
            start = 0
            while True:
                pos = text_lower.find(word, start)
                if pos == -1:
                    break
                spans.append({"start": pos, "end": pos + len(word)})
                start = pos + len(word)
        
        return spans

    def get_daily_verse(self, locale: str = "en") -> Optional[Dict]:
        """Get daily verse (for MVP, return a fixed popular verse)."""
        # For MVP: return Psalm 23:1-4
        if locale == "ru":
            return self.get_verse_by_ref("Псалом 23:1-4", locale)
        else:
            return self.get_verse_by_ref("Psalm 23:1-4", locale)

    def get_nearest_passages(self, locale: str = "en", count: int = 3) -> List[Dict]:
        """Get nearest/popular passages when search returns no results."""
        if locale not in self.translations:
            locale = "en"
        
        # Return first N verses as fallback
        verses = list(self.translations[locale].values())
        return verses[:count]
