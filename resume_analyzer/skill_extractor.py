"""
skill_extractor.py
------------------
Hybrid skill extraction pipeline:

  Stage 1 – Dictionary matching      (exact + alias)
  Stage 2 – NLP entity extraction    (spaCy noun chunks, optional)
  Stage 3 – Fuzzy matching           (rapidfuzz, fills remaining gaps)
  Stage 4 – Contextual window scan   (±3 lines around skill-dense zones)
  Stage 5 – Deduplication + scoring  (confidence 0-100)

spaCy and rapidfuzz are optional; the system degrades gracefully if missing.
"""

import re
import math
from typing import Dict, List, Optional, Set, Tuple
from skill_dictionary import (
    SKILL_LOOKUP, ALIAS_TO_CANONICAL, RAW_SKILLS, resolve_skill,
)

# ── Optional imports (graceful degradation) ──────────────────────────────────
try:
    import spacy
    _NLP = spacy.load("en_core_web_sm")
    _SPACY_AVAILABLE = True
except Exception:
    _NLP = None
    _SPACY_AVAILABLE = False

try:
    from rapidfuzz import fuzz, process as rfprocess
    _FUZZY_AVAILABLE = True
except ImportError:
    _FUZZY_AVAILABLE = False

# All candidate strings (canonical names + aliases) for fuzzy lookup
_ALL_CANDIDATES: List[str] = list(SKILL_LOOKUP.keys()) + list(ALIAS_TO_CANONICAL.keys())

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

# Minimum fuzzy score (0-100) to accept a match
FUZZY_THRESHOLD = 82

# Special regex for skills whose names contain symbols
_SPECIAL_PATTERNS: Dict[str, re.Pattern] = {
    "C":     re.compile(r"(?<![A-Za-z>+#(])C(?![+#A-Za-z+])", re.MULTILINE),
    "C++":   re.compile(r"C\+\+",  re.IGNORECASE),
    "C#":    re.compile(r"C#",     re.IGNORECASE),
    "R":     re.compile(r"(?<![A-Za-z])R(?![A-Za-z0-9])", re.MULTILINE),
    ".NET":  re.compile(r"\.NET\b", re.IGNORECASE),
    "F#":    re.compile(r"F#",      re.IGNORECASE),
    "GD&T":  re.compile(r"GD&T",   re.IGNORECASE),
    "CI/CD": re.compile(r"CI/CD|CI-CD|CI–CD", re.IGNORECASE),
    "LAN/WAN": re.compile(r"LAN/WAN|LAN-WAN", re.IGNORECASE),
    "SSL/TLS": re.compile(r"SSL/TLS|SSL-TLS|TLS/SSL", re.IGNORECASE),
    "TCP/IP":  re.compile(r"TCP/IP|TCP-IP", re.IGNORECASE),
}

# Regex that matches word boundaries for plain alphanumeric tokens
def _build_word_regex(word: str) -> re.Pattern:
    escaped = re.escape(word)
    if re.fullmatch(r"[A-Za-z0-9]+", word):
        return re.compile(rf"\b{escaped}\b", re.IGNORECASE)
    if " " in word:
        return re.compile(rf"(?i){escaped}")
    return re.compile(rf"(?i){escaped}")


# Proficiency indicators → level bonus
_PROF_BONUS = {
    "expert":     22, "advanced": 20, "senior": 18,
    "proficient": 14, "strong":   13, "solid":  13, "hands-on": 12,
    "extensive":  12, "familiar": 6,  "basic":  5,  "beginner": 4,
    "exposure":   4,
}

# Years-of-experience → level bonus cap
_YRS_BONUS_MAP = {1: 3, 2: 6, 3: 10, 4: 14, 5: 18}  # years → bonus


# ─────────────────────────────────────────────────────────────────────────────
# DATA CLASSES
# ─────────────────────────────────────────────────────────────────────────────

class ExtractedSkill:
    def __init__(self, name: str, category: str, weight: float,
                 level: int = 50, confidence: int = 70,
                 sources: Optional[List[str]] = None):
        self.name       = name
        self.category   = category
        self.weight     = weight
        self.level      = level           # 0-100 proficiency estimate
        self.confidence = confidence      # 0-100 extraction confidence
        self.sources    = sources or []   # where this skill was found

    def to_dict(self) -> Dict:
        return {
            "name":       self.name,
            "category":   self.category,
            "level":      self.level,
            "confidence": self.confidence,
            "sources":    self.sources,
        }


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC API
# ─────────────────────────────────────────────────────────────────────────────

def extract_skills(parsed_resume: Dict) -> List[ExtractedSkill]:
    """
    Run the full hybrid extraction pipeline.

    Args:
        parsed_resume: output of resume_parser.parse_resume()

    Returns:
        List[ExtractedSkill] sorted by level descending, top 50.
    """
    seen: Dict[str, ExtractedSkill] = {}   # canonical_lower → ExtractedSkill

    # Text segments and their source labels
    text_segments: List[Tuple[str, str]] = [
        (parsed_resume.get("skills_section", ""),    "skills_section"),
        (parsed_resume.get("summary", ""),           "summary"),
        (parsed_resume.get("soft_skills", ""),       "soft_skills"),
    ]
    for exp in parsed_resume.get("experience", []):
        text_segments.append((exp.get("description", ""), "experience"))
    for proj in parsed_resume.get("projects", []):
        text_segments.append((proj.get("description", ""), "projects"))
    for cert in parsed_resume.get("certifications", []):
        text_segments.append((cert, "certifications"))

    # Also run against full text so nothing is missed
    text_segments.append((parsed_resume.get("all_text", ""), "full_text"))

    for segment_text, source_label in text_segments:
        if not segment_text or not segment_text.strip():
            continue

        # Stage 1: Dictionary matching
        _stage1_dictionary(segment_text, source_label, seen)

        # Stage 2: NLP noun-chunk extraction (if spaCy available)
        if _SPACY_AVAILABLE:
            _stage2_nlp(segment_text, source_label, seen)

        # Stage 3: Fuzzy matching on unmatched tokens
        if _FUZZY_AVAILABLE and source_label in ("skills_section", "full_text"):
            _stage3_fuzzy(segment_text, source_label, seen)

    # Post-process: recalculate levels using full text
    full_text = parsed_resume.get("all_text", "")
    for key, skill in seen.items():
        skill.level = _calculate_level(full_text, skill.name, skill.sources)

    # Sort: by level desc → name asc, return top 50
    results = sorted(seen.values(), key=lambda s: (-s.level, s.name))
    return results[:50]


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 1 — Dictionary matching
# ─────────────────────────────────────────────────────────────────────────────

def _stage1_dictionary(text: str, source: str, seen: Dict[str, ExtractedSkill]) -> None:
    """
    Match all canonical skills + aliases against text.
    Uses special regex patterns for symbols (C++, C#, etc.).
    """
    text_lower = text.lower()

    # Special-cased skills first (C, C++, C#, R, .NET …)
    for skill_name, pattern in _SPECIAL_PATTERNS.items():
        if pattern.search(text):
            entry = SKILL_LOOKUP.get(skill_name.lower())
            if entry:
                _add_or_update(seen, entry, source, confidence=90)

    # All canonical skills (skip those already handled by special patterns)
    for key, entry in SKILL_LOOKUP.items():
        if key in {s.lower() for s in _SPECIAL_PATTERNS}:
            continue   # already handled

        skill_lower = key
        # Multi-word: simple substring match
        if " " in skill_lower:
            if skill_lower in text_lower:
                _add_or_update(seen, entry, source, confidence=85)
            continue

        # Single-word: word-boundary regex
        regex = _build_word_regex(key)
        if regex.search(text):
            _add_or_update(seen, entry, source, confidence=90)

    # Aliases (handles synonyms like "nodejs" → "Node.js")
    for alias, canonical_key in ALIAS_TO_CANONICAL.items():
        if alias in text_lower or re.search(rf"\b{re.escape(alias)}\b", text_lower):
            entry = SKILL_LOOKUP.get(canonical_key)
            if entry:
                _add_or_update(seen, entry, source, confidence=85)


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2 — NLP noun-chunk extraction (spaCy)
# ─────────────────────────────────────────────────────────────────────────────

def _stage2_nlp(text: str, source: str, seen: Dict[str, ExtractedSkill]) -> None:
    """
    Use spaCy to extract noun chunks and named entities, then try to resolve
    them against the skill dictionary.
    """
    if not _NLP or len(text) > 500_000:
        return

    # Limit text length for performance
    doc = _NLP(text[:10_000])

    candidates: Set[str] = set()
    for chunk in doc.noun_chunks:
        candidates.add(chunk.text.strip())
    for ent in doc.ents:
        candidates.add(ent.text.strip())

    for cand in candidates:
        cand_clean = cand.strip()
        if len(cand_clean) < 2:
            continue
        entry = resolve_skill(cand_clean)
        if entry:
            _add_or_update(seen, entry, source, confidence=75)


# ─────────────────────────────────────────────────────────────────────────────
# STAGE 3 — Fuzzy matching
# ─────────────────────────────────────────────────────────────────────────────

def _stage3_fuzzy(text: str, source: str, seen: Dict[str, ExtractedSkill]) -> None:
    """
    Tokenise text into word-groups (n-grams up to 3 words) and try fuzzy
    matching against the full skill + alias dictionary.
    """
    words = re.findall(r"[A-Za-z][\w.+#/\-]*", text)
    # Generate 1-gram, 2-gram, 3-gram phrases
    phrases: List[str] = []
    for n in (1, 2, 3):
        for i in range(len(words) - n + 1):
            phrases.append(" ".join(words[i:i+n]))

    for phrase in phrases:
        phrase_l = phrase.lower()
        # Skip very short or already matched
        if len(phrase_l) < 3:
            continue
        if phrase_l in seen:
            continue

        # Use rapidfuzz: check against all canonical + alias strings
        match, score, _ = rfprocess.extractOne(
            phrase_l, _ALL_CANDIDATES, scorer=fuzz.token_sort_ratio
        )
        if score >= FUZZY_THRESHOLD:
            entry = resolve_skill(match) or SKILL_LOOKUP.get(match)
            if entry:
                _add_or_update(seen, entry, source, confidence=max(50, score - 10))


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _add_or_update(
    seen: Dict[str, ExtractedSkill],
    entry: Dict,
    source: str,
    confidence: int,
) -> None:
    """Add a new skill or update an existing one's sources and confidence."""
    key = entry["name"].lower()
    if key in seen:
        skill = seen[key]
        if source not in skill.sources:
            skill.sources.append(source)
        skill.confidence = min(100, max(skill.confidence, confidence))
    else:
        seen[key] = ExtractedSkill(
            name=entry["name"],
            category=entry["category"],
            weight=entry["weight"],
            level=50,
            confidence=confidence,
            sources=[source],
        )


def _calculate_level(full_text: str, skill_name: str, sources: List[str]) -> int:
    """
    Estimate proficiency level (30-95) based on:
      - mention count (density)
      - proficiency cue words near skill mentions
      - years-of-experience expressions
      - section bonuses
    """
    text_lower = full_text.lower()
    skill_lower = skill_name.lower()

    # Use special regex for symbol-heavy names
    pattern = _SPECIAL_PATTERNS.get(skill_name) or _build_word_regex(skill_name)
    matches = list(pattern.finditer(full_text))
    mention_count = len(matches)

    if mention_count == 0:
        return 30

    score = 25
    # Density bonus
    score += min(mention_count * 8, 32)

    # Section bonus: skills_section or certifications → higher confidence
    if "skills_section" in sources or "certifications" in sources:
        score += 8
    if "experience" in sources:
        score += 5
    if "projects" in sources:
        score += 4

    # Proficiency cue scan: check the line each match is on
    lines = full_text.split("\n")
    prof_bonus = 0
    for line in lines:
        line_lower = line.lower()
        if skill_lower not in line_lower:
            continue
        for cue, bonus in _PROF_BONUS.items():
            if cue in line_lower:
                prof_bonus = max(prof_bonus, bonus)
                break
    score += prof_bonus

    # Years-of-experience scan (looks for "X years" near skill name)
    yrs_bonus = _years_bonus(text_lower, skill_lower)
    score += yrs_bonus

    # Penalise single mentions with no context
    if mention_count == 1 and prof_bonus == 0 and yrs_bonus == 0:
        score -= 6

    return _clamp(round(score), 30, 95)


def _years_bonus(text_lower: str, skill_lower: str) -> int:
    escaped = re.escape(skill_lower)
    patterns = [
        re.compile(rf"(\d{{1,2}})\+?\s*years?[^\n\r]{{0,60}}{escaped}", re.IGNORECASE),
        re.compile(rf"{escaped}[^\n\r]{{0,60}}(\d{{1,2}})\+?\s*years?", re.IGNORECASE),
    ]
    max_yrs = 0
    for pat in patterns:
        for m in pat.finditer(text_lower):
            try:
                yrs = int(m.group(1))
                max_yrs = max(max_yrs, yrs)
            except (IndexError, ValueError):
                pass
    return _YRS_BONUS_MAP.get(min(max_yrs, 5), 0)


def _clamp(value: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, value))
