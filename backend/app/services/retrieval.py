from typing import List, Dict, Any
async def retrieve(q: str, translation: str = "WEB", k_text: int = 50, k_vec: int = 50) -> List[Dict[str, Any]]:
    return [
        {"translation": translation, "book": 19, "chapter": 23, "verse": 1, "text": "The Lord is my shepherd; I shall not want."},
        {"translation": translation, "book": 19, "chapter": 46, "verse": 1, "text": "God is our refuge and strength, a very present help in trouble."},
    ]
