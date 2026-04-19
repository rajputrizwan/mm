"""
resume_parser.py
----------------
Parses raw resume text into structured sections:
  - contact
  - summary
  - skills_section
  - experience       (list of jobs with raw description text)
  - education        (list of entries)
  - projects         (list of entries)
  - certifications   (list)
  - all_text         (complete normalised text, used as fallback)

Does NOT require spaCy — pure regex + heuristics.
"""

import re
from typing import Dict, List, Optional


# ---------------------------------------------------------------------------
# Section header patterns (order matters — earlier = higher priority)
# ---------------------------------------------------------------------------

SECTION_PATTERNS: List[tuple] = [
    ("summary",          r"professional\s+summary|summary|objective|profile|about\s+me"),
    ("skills_section",   r"technical\s+skills?|skills?|competencies|expertise|core\s+skills?|technologies"),
    ("experience",       r"(professional\s+)?experience|work\s+experience|employment(\s+history)?|career"),
    ("education",        r"education(\s+background)?|academic|qualifications?|degrees?"),
    ("projects",         r"projects?(\s+&?\s+achievements?)?|personal\s+projects?|key\s+projects?"),
    ("certifications",   r"certifications?|licenses?|accreditations?|credentials?"),
    ("awards",           r"awards?|honors?|achievements?|accomplishments?"),
    ("languages",        r"languages?(\s+spoken)?"),
    ("interests",        r"interests?|hobbies?|activities?"),
    ("soft_skills",      r"soft\s+skills?|interpersonal\s+skills?"),
]

_SECTION_RE = re.compile(
    r"^[ \t]*(?:(?P<title>" +
    "|".join(f"(?P<s{i}>{ p })" for i, (_, p) in enumerate(SECTION_PATTERNS)) +
    r"))\s*[:\-–]?\s*$",
    re.IGNORECASE | re.MULTILINE,
)

# Map from group name → section key
_GROUP_TO_KEY: Dict[str, str] = {
    f"s{i}": key for i, (key, _) in enumerate(SECTION_PATTERNS)
}

# Experience entry detector (position + company on same/adjacent line)
_DATE_RE = re.compile(
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*"
    r"[\s,.-]+\d{4}|"
    r"\d{1,2}[/.\-]\d{4}|"
    r"\b\d{4}\b",
    re.IGNORECASE,
)

_JOB_TITLE_WORDS = re.compile(
    r"\b(engineer|developer|designer|manager|analyst|architect|consultant|"
    r"specialist|director|lead|intern|coordinator|administrator|officer|"
    r"technician|scientist|researcher|programmer|devops|data scientist|"
    r"full.?stack|back.?end|front.?end|software|system|network|security|"
    r"electrical|mechanical|hardware|embedded|firmware)\b",
    re.IGNORECASE,
)


def normalise_text(text: str) -> str:
    """Standard normalisation: fix encodings, ligatures, bullets, whitespace."""
    # Remove null bytes
    t = text.replace("\x00", "")

    # PDF ligatures
    t = (t.replace("\ufb01", "fi").replace("\ufb02", "fl")
          .replace("\ufb00", "ff").replace("\ufb03", "ffi")
          .replace("\ufb04", "ffl"))

    # Bullet / separator chars → newline
    t = re.sub(r"[•·▪▸▹◦‣⁃→➔►●○■□]", "\n", t)

    # Page numbers:  "Page 1 of 3", "– 2 –", "1 | Name"
    t = re.sub(r"^\s*[-–]?\s*[Pp]age\s+\d+\s*(of\s+\d+)?\s*[-–]?\s*$", "", t, flags=re.MULTILINE)
    t = re.sub(r"^\s*-+\s*\d+\s*-+\s*$", "", t, flags=re.MULTILINE)

    # Repair hyphenated line-breaks:  micro-\nservices → microservices
    t = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", t)

    # Expand common abbreviations
    abbrev = {
        r"\bElec\.\s*Eng\.": "Electrical Engineering",
        r"\bMech\.\s*Eng\.": "Mechanical Engineering",
        r"\bComp\.\s*Sci\.": "Computer Science",
        r"\bInfo\.\s*Tech\.": "Information Technology",
        r"\bSr\.":           "Senior",
        r"\bJr\.":           "Junior",
        r"\bMgmt\.":         "Management",
        r"\bw/":             "with",
        r"\byr\b":           "year",
        r"\byrs\b":          "years",
    }
    for pattern, replacement in abbrev.items():
        t = re.sub(pattern, replacement, t, flags=re.IGNORECASE)

    # Normalise whitespace
    t = t.replace("\r", "\n")
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()


def parse_resume(raw_text: str) -> Dict:
    """
    Main entry point.
    Returns a dict with keys:
      contact, summary, skills_section, experience, education,
      projects, certifications, all_text
    """
    text = normalise_text(raw_text)
    sections = _split_into_sections(text)

    result = {
        "contact":        _extract_contact(text),
        "summary":        sections.get("summary", ""),
        "skills_section": sections.get("skills_section", ""),
        "experience":     _parse_experience(sections.get("experience", "")),
        "education":      _parse_education(sections.get("education", "")),
        "projects":       _parse_projects(sections.get("projects", "")),
        "certifications": _parse_certifications(sections.get("certifications", "")),
        "soft_skills":    sections.get("soft_skills", ""),
        "all_text":       text,
    }
    return result


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _split_into_sections(text: str) -> Dict[str, str]:
    """Split resume text into labelled sections using header detection."""
    lines = text.split("\n")
    sections: Dict[str, List[str]] = {}
    current_key: Optional[str] = None

    for line in lines:
        stripped = line.strip()
        matched_key = _detect_section_header(stripped)

        if matched_key:
            current_key = matched_key
            sections.setdefault(current_key, [])
        elif current_key:
            sections[current_key].append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items()}


def _detect_section_header(line: str) -> Optional[str]:
    """Return section key if `line` looks like a section header, else None."""
    if not line or len(line) > 80:
        return None
    for key, pattern in SECTION_PATTERNS:
        if re.fullmatch(pattern + r"\s*[:\-–]?", line, re.IGNORECASE):
            return key
    # Also match ALL-CAPS headers like "PROFESSIONAL EXPERIENCE"
    if line.isupper() and 3 < len(line) < 60:
        for key, pattern in SECTION_PATTERNS:
            if re.search(pattern, line, re.IGNORECASE):
                return key
    return None


def _extract_contact(text: str) -> Dict:
    """Extract email, phone, LinkedIn, GitHub from the first 15 lines."""
    first_block = "\n".join(text.split("\n")[:15])
    contact = {}

    email_m = re.search(r"[\w.+-]+@[\w-]+\.\w+", first_block)
    if email_m:
        contact["email"] = email_m.group()

    phone_m = re.search(r"[\+\(]?[\d\s\-\(\)]{7,15}", first_block)
    if phone_m:
        contact["phone"] = phone_m.group().strip()

    linkedin_m = re.search(r"linkedin\.com/in/[\w-]+", first_block, re.IGNORECASE)
    if linkedin_m:
        contact["linkedin"] = linkedin_m.group()

    github_m = re.search(r"github\.com/[\w-]+", first_block, re.IGNORECASE)
    if github_m:
        contact["github"] = github_m.group()

    return contact


def _parse_experience(section_text: str) -> List[Dict]:
    """
    Split an experience section into individual job entries.
    Each entry has: title, company, dates, description
    """
    if not section_text:
        return []

    lines = section_text.split("\n")
    entries: List[Dict] = []
    current: Optional[Dict] = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        is_job_line = (
            _JOB_TITLE_WORDS.search(stripped)
            and len(stripped) < 120
        )
        is_date_line = bool(_DATE_RE.search(stripped)) and len(stripped) < 80

        # A new job entry starts on a title line or date line near a title
        if is_job_line and ("|" in stripped or "–" in stripped or "at" in stripped.lower() or is_date_line):
            if current:
                entries.append(current)
            current = {
                "raw_header": stripped,
                "description": [],
            }
        elif current:
            current["description"].append(stripped)

    if current:
        entries.append(current)

    # Flatten description lists
    for entry in entries:
        entry["description"] = " ".join(entry["description"])

    # If no structured entries found, return the whole section as one entry
    if not entries and section_text.strip():
        entries = [{"raw_header": "", "description": section_text}]

    return entries


def _parse_education(section_text: str) -> List[Dict]:
    """Extract education entries."""
    if not section_text:
        return []

    degree_re = re.compile(
        r"bachelor|master|phd|b\.?sc|m\.?sc|b\.?e|m\.?e|b\.?tech|m\.?tech|"
        r"associate|diploma|certificate|high school|secondary",
        re.IGNORECASE,
    )

    lines = [l.strip() for l in section_text.split("\n") if l.strip()]
    entries: List[Dict] = []
    current: Optional[Dict] = None

    for line in lines:
        if degree_re.search(line):
            if current:
                entries.append(current)
            current = {"degree": line, "details": []}
        elif current:
            current["details"].append(line)

    if current:
        entries.append(current)

    if not entries and section_text.strip():
        entries = [{"degree": "", "details": [section_text]}]

    return entries


def _parse_projects(section_text: str) -> List[Dict]:
    """Extract project entries."""
    if not section_text:
        return []
    # Projects separated by blank lines or all-caps lines
    blocks = re.split(r"\n{2,}", section_text.strip())
    projects = []
    for block in blocks:
        block = block.strip()
        if block:
            lines = block.split("\n")
            projects.append({
                "title": lines[0].strip(),
                "description": " ".join(l.strip() for l in lines[1:]),
            })
    return projects


def _parse_certifications(section_text: str) -> List[str]:
    """Extract certification names."""
    if not section_text:
        return []
    certs = []
    for line in section_text.split("\n"):
        line = re.sub(r"^[\-•*\d.]+\s*", "", line).strip()
        if line and len(line) > 3:
            certs.append(line)
    return certs
