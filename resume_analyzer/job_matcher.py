"""
job_matcher.py
--------------
Job description parser + weighted match scoring engine.

Scoring formula (when JD provided):
  Skills Match      → 50%
  Experience Match  → 30%
  Keyword Match     → 20%

Techniques:
  - Exact + alias skill matching
  - TF-IDF cosine similarity (sklearn) for experience & keyword components
  - Sentence-transformers (optional) for semantic similarity upgrade
  - Synonym / semantic group aware partial matching
"""

import re
import math
from typing import Dict, List, Optional, Set, Tuple
from skill_dictionary import (
    SKILL_LOOKUP, ALIAS_TO_CANONICAL, resolve_skill,
    SEMANTIC_GROUPS, RAW_SKILLS,
)

# ── Optional ML imports ────────────────────────────────────────────────────
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    _SKLEARN_AVAILABLE = True
except ImportError:
    _SKLEARN_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer, util as st_util
    _ST_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    _ST_AVAILABLE = True
except Exception:
    _ST_MODEL = None
    _ST_AVAILABLE = False

# ─────────────────────────────────────────────────────────────────────────────
# STOP WORDS (simple built-in list to avoid nltk dependency)
# ─────────────────────────────────────────────────────────────────────────────
_STOP_WORDS: Set[str] = {
    "the", "a", "an", "is", "are", "in", "on", "at", "to", "for",
    "of", "and", "or", "but", "with", "we", "you", "our", "your",
    "be", "have", "has", "will", "should", "must", "can", "may",
    "that", "this", "from", "about", "using", "use", "any", "all",
    "as", "by", "up", "their", "they", "it", "its", "him", "her",
    "also", "such", "not", "do", "work", "role", "position",
}

# Markers for required vs preferred sections in JD
_REQUIRED_MARKERS = {
    "required", "must have", "must-have", "requirements",
    "qualifications", "mandatory", "essential", "you will",
    "responsibilities", "you need", "minimum", "basic qualifications",
}
_PREFERRED_MARKERS = {
    "preferred", "nice to have", "nice-to-have", "bonus",
    "desirable", "advantageous", "optional", "plus", "ideally",
    "good to have", "a plus",
}


# ─────────────────────────────────────────────────────────────────────────────
# PARSED JOB DESCRIPTION
# ─────────────────────────────────────────────────────────────────────────────

class ParsedJobDescription:
    def __init__(
        self,
        title: str,
        raw_description: str,
        required_skills: List[str],
        preferred_skills: List[str],
        all_keywords: Set[str],
        full_text: str,
    ):
        self.title            = title
        self.raw_description  = raw_description
        self.required_skills  = required_skills   # canonical names
        self.preferred_skills = preferred_skills  # canonical names
        self.all_keywords     = all_keywords       # meaningful tokens
        self.full_text        = full_text          # normalised JD text

    def all_required_and_preferred(self) -> List[str]:
        return list(dict.fromkeys(self.required_skills + self.preferred_skills))


# ─────────────────────────────────────────────────────────────────────────────
# MATCH RESULT
# ─────────────────────────────────────────────────────────────────────────────

class MatchResult:
    def __init__(
        self,
        match_score: int,
        skills_match_pct: float,
        experience_match_pct: float,
        keyword_match_pct: float,
        matched_skills: List[str],
        missing_skills: List[str],
        partial_matches: List[Dict],
        skill_gaps: List[Dict],
    ):
        self.match_score           = match_score
        self.skills_match_pct      = round(skills_match_pct, 1)
        self.experience_match_pct  = round(experience_match_pct, 1)
        self.keyword_match_pct     = round(keyword_match_pct, 1)
        self.matched_skills        = matched_skills
        self.missing_skills        = missing_skills
        self.partial_matches       = partial_matches
        self.skill_gaps            = skill_gaps

    def to_dict(self) -> Dict:
        return {
            "match_score": self.match_score,
            "breakdown": {
                "skills_match":     self.skills_match_pct,
                "experience_match": self.experience_match_pct,
                "keyword_match":    self.keyword_match_pct,
            },
            "matched_skills":  self.matched_skills,
            "missing_skills":  self.missing_skills,
            "partial_matches": self.partial_matches,
            "skill_gaps":      self.skill_gaps,
        }


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC API
# ─────────────────────────────────────────────────────────────────────────────

def parse_job_description(title: str, description: str) -> ParsedJobDescription:
    """
    Parse a raw job description into structured form:
      - required skills
      - preferred skills
      - meaningful keyword set
    """
    title = (title or "").strip()
    description = (description or "").strip()
    full_text   = f"{title}\n{description}".lower()

    required_skills : List[str] = []
    preferred_skills: List[str] = []
    all_keywords    : Set[str]  = set()

    # ── Section-aware skill extraction ──────────────────────────────────────
    lines = description.split("\n")
    mode = "required"   # default: treat all as required

    for line in lines:
        line_l = line.strip().lower()
        if not line_l:
            continue

        # Detect mode switch
        if any(m in line_l for m in _REQUIRED_MARKERS):
            mode = "required"
        elif any(m in line_l for m in _PREFERRED_MARKERS):
            mode = "preferred"

        # Extract skills from this line
        line_skills = _extract_skills_from_text(line)
        for skill_name in line_skills:
            if mode == "required":
                if skill_name not in required_skills:
                    required_skills.append(skill_name)
            else:
                if skill_name not in preferred_skills and skill_name not in required_skills:
                    preferred_skills.append(skill_name)

        # Tokenise line into keywords
        tokens = re.findall(r"[a-z0-9][\w.+#/\-]*", line_l)
        all_keywords.update(t for t in tokens if t not in _STOP_WORDS and len(t) >= 2)

    # Fallback: if no structured sections, scan full description
    if not required_skills:
        required_skills = _extract_skills_from_text(description)

    return ParsedJobDescription(
        title            = title,
        raw_description  = description,
        required_skills  = required_skills,
        preferred_skills = preferred_skills,
        all_keywords     = all_keywords,
        full_text        = full_text,
    )


def calculate_match_score(
    extracted_skills: List,        # List[ExtractedSkill] from skill_extractor
    parsed_jd: ParsedJobDescription,
    experience_entries: Optional[List[Dict]] = None,
) -> MatchResult:
    """
    Calculate weighted match score.

    Components:
      Skills Match      50%  – how many JD-required skills the resume has
      Experience Match  30%  – semantic similarity of experience to JD
      Keyword Match     20%  – overlap of JD keywords with resume skills
    """
    if not extracted_skills:
        return MatchResult(0, 0.0, 0.0, 0.0, [], [], [], [])

    # Resume skill name sets
    resume_skill_names   = {s.name.lower() for s in extracted_skills}
    resume_skill_display = {s.name.lower(): s.name for s in extracted_skills}

    # ── Component 1: Skills Match (50%) ─────────────────────────────────────
    required  = [s.lower() for s in parsed_jd.required_skills]
    preferred = [s.lower() for s in parsed_jd.preferred_skills]

    matched_required = [s for s in required  if s in resume_skill_names]
    matched_preferred= [s for s in preferred if s in resume_skill_names]
    missing_required = [s for s in required  if s not in resume_skill_names]
    missing_preferred= [s for s in preferred if s not in resume_skill_names]

    # Partial matches via semantic groups
    partial_matches: List[Dict] = _find_partial_matches(
        resume_skill_names, set(required + preferred)
    )
    partial_credit = sum(p["credit"] for p in partial_matches)

    total_required  = len(required)  or 1
    total_preferred = len(preferred) or 1

    required_ratio  = len(matched_required)  / total_required
    preferred_ratio = len(matched_preferred) / total_preferred

    # Weight required skills more than preferred
    raw_skills_pct = (
        (required_ratio  * 0.75 +
         preferred_ratio * 0.20 +
         min(partial_credit / total_required, 0.05)) * 100
    )
    skills_match_pct = min(raw_skills_pct, 100.0)

    # ── Component 2: Experience Match (30%) ──────────────────────────────────
    experience_match_pct = _calculate_experience_match(
        experience_entries or [],
        parsed_jd.full_text,
        resume_skill_names,
    )

    # ── Component 3: Keyword Match (20%) ────────────────────────────────────
    keyword_match_pct = _calculate_keyword_match(
        resume_skill_names,
        parsed_jd.all_keywords,
    )

    # ── Blend ─────────────────────────────────────────────────────────────
    blended = (
        skills_match_pct      * 0.50 +
        experience_match_pct  * 0.30 +
        keyword_match_pct     * 0.20
    )
    final_score = _clamp(round(blended), 0, 99)

    # ── Build output lists ────────────────────────────────────────────────
    matched_display  = [
        resume_skill_display.get(s, s.title()) for s in matched_required + matched_preferred
    ]
    missing_display  = [_canonical_display(s) for s in missing_required]
    missing_pref_display = [_canonical_display(s) for s in missing_preferred]

    skill_gaps = _build_skill_gaps(missing_required, missing_preferred)

    return MatchResult(
        match_score           = final_score,
        skills_match_pct      = skills_match_pct,
        experience_match_pct  = experience_match_pct,
        keyword_match_pct     = keyword_match_pct,
        matched_skills        = matched_display,
        missing_skills        = missing_display + missing_pref_display,
        partial_matches       = partial_matches,
        skill_gaps            = skill_gaps,
    )


def identify_skill_gaps(
    extracted_skills: List,
    parsed_jd: ParsedJobDescription,
) -> List[Dict]:
    """Convenience wrapper — returns gap list with priority labels."""
    resume_names = {s.name.lower() for s in extracted_skills}
    required     = [s.lower() for s in parsed_jd.required_skills]
    preferred    = [s.lower() for s in parsed_jd.preferred_skills]
    missing_req  = [s for s in required  if s not in resume_names]
    missing_pref = [s for s in preferred if s not in resume_names]
    return _build_skill_gaps(missing_req, missing_pref)


# ─────────────────────────────────────────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _extract_skills_from_text(text: str) -> List[str]:
    """Extract canonical skill names from arbitrary text."""
    found: List[str] = []
    seen:  Set[str]  = set()
    text_lower = text.lower()

    for key, entry in SKILL_LOOKUP.items():
        name_l = entry["name"].lower()
        if " " in name_l:
            if name_l in text_lower and name_l not in seen:
                found.append(entry["name"])
                seen.add(name_l)
        else:
            if re.search(rf"\b{re.escape(key)}\b", text_lower) and key not in seen:
                found.append(entry["name"])
                seen.add(key)

    for alias, canonical in ALIAS_TO_CANONICAL.items():
        if alias in text_lower or re.search(rf"\b{re.escape(alias)}\b", text_lower):
            entry = SKILL_LOOKUP.get(canonical)
            if entry and entry["name"].lower() not in seen:
                found.append(entry["name"])
                seen.add(entry["name"].lower())

    return found


def _find_partial_matches(
    resume_skills: Set[str],
    jd_skills: Set[str],
) -> List[Dict]:
    """
    Credit partial matches using semantic groups.
    E.g., if JD needs "Frontend Development" and resume has "React", give partial credit.
    """
    partials: List[Dict] = []

    for group_name, group_members in SEMANTIC_GROUPS.items():
        group_lower = {m.lower() for m in group_members}
        # Check if this group overlaps with what JD requires
        jd_overlap   = jd_skills & group_lower
        if not jd_overlap:
            continue
        # Check how many group skills the resume has
        resume_overlap = resume_skills & group_lower
        if resume_overlap and jd_overlap - resume_overlap:  # partial
            credit = len(resume_overlap) / (len(jd_overlap) + len(group_lower) * 0.3)
            credit = round(min(credit * 0.5, 0.3), 3)   # cap partial credit at 0.3
            if credit > 0.05:
                partials.append({
                    "group":         group_name,
                    "jd_skills":     list(jd_overlap),
                    "resume_skills": list(resume_overlap),
                    "credit":        credit,
                })

    return partials


def _calculate_experience_match(
    experience_entries: List[Dict],
    jd_text: str,
    resume_skill_names: Set[str],
) -> float:
    """
    Score experience relevance (0-100).
    Strategy:
      1. If sentence-transformers available → use cosine similarity of
         concatenated experience text vs JD text.
      2. Else if sklearn available → TF-IDF cosine similarity.
      3. Fallback → keyword overlap ratio between experience and JD.
    """
    exp_text = " ".join(
        e.get("description", "") for e in experience_entries
    ).strip()

    if not exp_text:
        # No structured experience extracted — use skill presence as proxy
        return min(len(resume_skill_names) * 3.0, 75.0)

    # --- Semantic similarity (best) ---
    if _ST_AVAILABLE and _ST_AVAILABLE:
        try:
            emb_exp = _ST_MODEL.encode(exp_text[:8000],  convert_to_tensor=True)
            emb_jd  = _ST_MODEL.encode(jd_text[:8000],  convert_to_tensor=True)
            sim = float(st_util.cos_sim(emb_exp, emb_jd))
            return _clamp(round(sim * 100, 1), 0, 100)
        except Exception:
            pass

    # --- TF-IDF cosine similarity ---
    if _SKLEARN_AVAILABLE:
        try:
            vec = TfidfVectorizer(
                stop_words="english",
                ngram_range=(1, 2),
                max_features=3000,
            )
            matrix = vec.fit_transform([exp_text, jd_text])
            sim = float(cosine_similarity(matrix[0], matrix[1])[0][0])
            return _clamp(round(sim * 100, 1), 0, 100)
        except Exception:
            pass

    # --- Fallback: keyword overlap ---
    exp_tokens = set(re.findall(r"[a-z]+", exp_text.lower()))
    jd_tokens  = set(re.findall(r"[a-z]+", jd_text.lower()))
    exp_tokens -= _STOP_WORDS
    jd_tokens  -= _STOP_WORDS
    if not jd_tokens:
        return 0.0
    overlap = len(exp_tokens & jd_tokens) / len(jd_tokens)
    return _clamp(round(overlap * 100, 1), 0, 100)


def _calculate_keyword_match(
    resume_skill_names: Set[str],
    jd_keywords: Set[str],
) -> float:
    """
    Score keyword overlap (0-100).
    Checks how many JD meaningful keywords appear in the resume's skill tokens.
    """
    if not jd_keywords:
        return 50.0   # neutral when no JD provided

    # Flatten resume skill names into tokens
    resume_tokens: Set[str] = set()
    for skill_name in resume_skill_names:
        parts = re.findall(r"[a-z0-9]+", skill_name.lower())
        resume_tokens.update(parts)

    hits = len(jd_keywords & resume_tokens)
    ratio = hits / len(jd_keywords)
    # Scale × 1.5 because JD keywords include non-skill words
    return _clamp(round(ratio * 150, 1), 0, 100)


def _build_skill_gaps(
    missing_required: List[str],
    missing_preferred: List[str],
) -> List[Dict]:
    """Build prioritised gap list with Critical / High / Medium labels."""
    gaps: List[Dict] = []
    seen: Set[str] = set()

    for skill in missing_required[:8]:
        display = _canonical_display(skill)
        key = display.lower()
        if key in seen:
            continue
        seen.add(key)
        gaps.append({
            "skill":          display,
            "priority":       "Critical",
            "recommendation": (
                f"This skill is required by the target role. "
                f"Build at least one project showcasing {display} or "
                f"obtain a relevant certification."
            ),
        })

    for skill in missing_preferred[:5]:
        display = _canonical_display(skill)
        key = display.lower()
        if key in seen:
            continue
        seen.add(key)
        gaps.append({
            "skill":          display,
            "priority":       "High",
            "recommendation": (
                f"{display} is listed as preferred by the employer. "
                f"Adding a portfolio project using {display} would strengthen your application."
            ),
        })

    return gaps[:10]


def _canonical_display(skill_lower: str) -> str:
    """Convert a lowercase canonical key to its display name."""
    entry = SKILL_LOOKUP.get(skill_lower)
    if entry:
        return entry["name"]
    # Title-case fallback
    return " ".join(w.capitalize() for w in skill_lower.split())


def _clamp(value, lo, hi):
    return max(lo, min(hi, value))
