import re
from typing import List

def clean_skill_string(skill: str) -> str:
    if not skill:
        return ""
    # Strip bullet points and punctuation
    cleaned = re.sub(r'^[•\-\*\s]+', '', skill)
    cleaned = re.sub(r'[\s\.\,]+$', '', cleaned)
    return cleaned.strip()

def extract_keywords_simple(text: str) -> List[str]:
    words = re.findall(r'\b[A-Za-z0-9\+#\.]+\b', text.lower())
    return list(set(words))
