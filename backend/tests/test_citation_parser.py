"""Unit tests for citation parser."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.citation_parser import CitationParser


def test_parse_citations_en():
    """Test parsing English citations."""
    text = "See John 3:16 and Philippians 4:6-7 for guidance."
    citations = CitationParser.parse_citations(text, locale="en")
    
    assert len(citations) == 2
    assert citations[0]["ref"] == "John 3:16"
    assert citations[0]["book"] == "John"
    assert citations[0]["chapter"] == "3"
    assert citations[0]["verse"] == "16"
    
    assert citations[1]["ref"] == "Philippians 4:6-7"
    print("✅ test_parse_citations_en passed")


def test_parse_citations_ru():
    """Test parsing Russian citations."""
    text = "Смотрите Иоанна 3:16 и Филиппийцам 4:6-7 для наставления."
    citations = CitationParser.parse_citations(text, locale="ru")
    
    assert len(citations) == 2
    assert citations[0]["ref"] == "Иоанна 3:16"
    assert citations[0]["book"] == "Иоанна"
    assert citations[0]["chapter"] == "3"
    assert citations[0]["verse"] == "16"
    
    assert citations[1]["ref"] == "Филиппийцам 4:6-7"
    print("✅ test_parse_citations_ru passed")


def test_parse_citations_with_numbers():
    """Test parsing citations with book numbers."""
    text = "Read 1 Corinthians 10:13 and 2 Timothy 1:7."
    citations = CitationParser.parse_citations(text, locale="en")
    
    assert len(citations) == 2
    assert citations[0]["ref"] == "1 Corinthians 10:13"
    assert citations[1]["ref"] == "2 Timothy 1:7"
    print("✅ test_parse_citations_with_numbers passed")


def test_parse_citations_no_matches():
    """Test parsing when no citations found."""
    text = "This is just regular text without any Bible references."
    citations = CitationParser.parse_citations(text, locale="en")
    
    assert len(citations) == 0
    print("✅ test_parse_citations_no_matches passed")


def test_validate_citation_en():
    """Test citation validation for English."""
    assert CitationParser.validate_citation("John 3:16", locale="en") is True
    assert CitationParser.validate_citation("1 Corinthians 10:13", locale="en") is True
    assert CitationParser.validate_citation("Invalid reference", locale="en") is False
    print("✅ test_validate_citation_en passed")


def test_validate_citation_ru():
    """Test citation validation for Russian."""
    assert CitationParser.validate_citation("Иоанна 3:16", locale="ru") is True
    assert CitationParser.validate_citation("1 Коринфянам 10:13", locale="ru") is True
    assert CitationParser.validate_citation("Неверная ссылка", locale="ru") is False
    print("✅ test_validate_citation_ru passed")


def test_parse_citations_duplicates():
    """Test that duplicate citations are removed."""
    text = "John 3:16 is important. I repeat, John 3:16 is crucial."
    citations = CitationParser.parse_citations(text, locale="en")
    
    assert len(citations) == 1
    assert citations[0]["ref"] == "John 3:16"
    print("✅ test_parse_citations_duplicates passed")


if __name__ == "__main__":
    test_parse_citations_en()
    test_parse_citations_ru()
    test_parse_citations_with_numbers()
    test_parse_citations_no_matches()
    test_validate_citation_en()
    test_validate_citation_ru()
    test_parse_citations_duplicates()
    print("\n✅ All citation parser tests passed!")
