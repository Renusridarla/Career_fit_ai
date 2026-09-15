import math
import re
import numpy as np
from typing import List, Dict, Set

def tokenize_and_vectorize(text: str) -> Dict[str, float]:
    """
    Computes term frequency vector for text snippet.
    """
    words = re.findall(r'\b[a-zA-Z0-9\+#\.]+\b', text.lower())
    if not words:
        return {}
    
    freq: Dict[str, float] = {}
    for w in words:
        freq[w] = freq.get(w, 0.0) + 1.0
        
    # L2 normalize
    norm = math.sqrt(sum(v * v for v in freq.values()))
    if norm > 0:
        for k in freq:
            freq[k] /= norm
            
    return freq

def cosine_similarity_vectors(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    if not vec1 or not vec2:
        return 0.0
    
    # Dot product
    common_keys = set(vec1.keys()).intersection(set(vec2.keys()))
    dot_product = sum(vec1[k] * vec2[k] for k in common_keys)
    return float(min(1.0, max(0.0, dot_product)))

def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculates semantic cosine similarity score between two text strings (0.0 to 1.0).
    """
    if not text1 or not text2:
        return 0.0
    v1 = tokenize_and_vectorize(text1)
    v2 = tokenize_and_vectorize(text2)
    return cosine_similarity_vectors(v1, v2)
