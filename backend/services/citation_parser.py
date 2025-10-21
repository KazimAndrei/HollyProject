"""Citation parser for extracting Bible references from text."""
import re
from typing import List, Dict


class CitationParser:
    """Parser for Bible citation references."""

    # English patterns
    EN_PATTERNS = [
        # "John 3:16", "1 Corinthians 10:13", "Psalm 23:1-4"
        r'(\d?\s?[A-Z][a-z]+)\s+(\d+):(\d+(?:-\d+)?)',
        # "Matthew 11:28-30"
        r'([A-Z][a-z]+)\s+(\d+):(\d+)-(\d+)',
    ]

    # Russian patterns
    RU_PATTERNS = [
        # "Иоанна 3:16", "1 Коринфянам 10:13", "Псалом 23:1-4"
        r'(\d?\s?[А-ЯЁ][а-яё]+)\s+(\d+):(\d+(?:-\d+)?)',
        # "Матфея 11:28-30"
        r'([А-ЯЁ][а-яё]+)\s+(\d+):(\d+)-(\d+)',
    ]

    @classmethod
    def parse_citations(cls, text: str, locale: str = "en") -> List[Dict[str, str]]:
        """Parse citations from text.
        
        Args:
            text: Text containing citations
            locale: Language locale (en/ru)
            
        Returns:
            List of parsed citations: [{"ref": "John 3:16", "book": "John", "chapter": "3", "verse": "16"}]
        """
        patterns = cls.RU_PATTERNS if locale == "ru" else cls.EN_PATTERNS
        citations = []
        
        for pattern in patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                groups = match.groups()
                if len(groups) >= 3:
                    book = groups[0].strip()
                    chapter = groups[1]
                    verse = groups[2] if len(groups) == 3 else f"{groups[2]}-{groups[3]}"
                    
                    citations.append({
                        "ref": f"{book} {chapter}:{verse}",
                        "book": book,
                        "chapter": chapter,
                        "verse": verse
                    })
        
        # Remove duplicates
        seen = set()
        unique_citations = []
        for c in citations:
            ref = c["ref"]
            if ref not in seen:
                seen.add(ref)
                unique_citations.append(c)
        
        return unique_citations

    @classmethod
    def validate_citation(cls, ref: str, locale: str = "en") -> bool:
        """Validate if a string is a valid citation.
        
        Args:
            ref: Citation reference (e.g., "John 3:16")
            locale: Language locale (en/ru)
            
        Returns:
            True if valid citation format
        """
        patterns = cls.RU_PATTERNS if locale == "ru" else cls.EN_PATTERNS
        
        for pattern in patterns:
            if re.match(pattern, ref):
                return True
        
        return False
