"""
main.py
-------
Orchestrator + FastAPI HTTP interface.

Standalone usage:
    python main.py

FastAPI usage (call from Node.js backend):
    uvicorn main:app --host 0.0.0.0 --port 8001
    POST /analyze  { "resume_text": "...", "job_title": "...", "job_description": "..." }
"""

import json
import sys
from typing import Dict, List, Optional

from resume_parser  import parse_resume
from skill_extractor import extract_skills
from job_matcher    import (
    parse_job_description,
    calculate_match_score,
    identify_skill_gaps,
)

# ── Optional FastAPI ──────────────────────────────────────────────────────────
try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    import uvicorn
    _FASTAPI_AVAILABLE = True
except ImportError:
    _FASTAPI_AVAILABLE = False


# ─────────────────────────────────────────────────────────────────────────────
# CORE ANALYSIS FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def analyze(
    resume_text:    str,
    job_title:      str = "",
    job_description:str = "",
) -> Dict:
    """
    Full pipeline:
      1. Parse resume text into sections
      2. Extract skills (hybrid: dict + NLP + fuzzy)
      3. Parse job description
      4. Calculate match score
      5. Return structured JSON-compatible dict

    Returns:
    {
      "extracted_skills": [...],
      "missing_skills":   [...],
      "match_score":      int,
      "breakdown": {
        "skills_match":     float,
        "experience_match": float,
        "keyword_match":    float,
      },
      "skill_gaps":      [...],
      "partial_matches": [...],
      "resume_sections": { ... },
    }
    """

    # Step 1: Parse resume
    parsed = parse_resume(resume_text)

    # Step 2: Extract skills
    skills = extract_skills(parsed)

    # Step 3: Parse JD (if provided)
    parsed_jd = parse_job_description(job_title, job_description)

    # Step 4: Match score
    if job_title or job_description:
        match_result = calculate_match_score(
            skills,
            parsed_jd,
            experience_entries=parsed.get("experience", []),
        )
    else:
        # No JD → return general competency score
        avg_level = sum(s.level for s in skills) / len(skills) if skills else 0
        general_score = int(min(avg_level * 0.9, 85))
        match_result = _NoJDMatchResult(general_score, skills)

    # Step 5: Build output
    extracted_skills_out = [
        {
            "name":       s.name,
            "category":   s.category,
            "level":      s.level,
            "confidence": s.confidence,
        }
        for s in skills
    ]

    return {
        "extracted_skills": extracted_skills_out,
        "missing_skills":   match_result.missing_skills,
        "match_score":      match_result.match_score,
        "breakdown": {
            "skills_match":     match_result.skills_match_pct,
            "experience_match": match_result.experience_match_pct,
            "keyword_match":    match_result.keyword_match_pct,
        },
        "matched_skills":  match_result.matched_skills,
        "skill_gaps":       match_result.skill_gaps if hasattr(match_result, "skill_gaps") else [],
        "partial_matches": match_result.partial_matches if hasattr(match_result, "partial_matches") else [],
        "resume_sections": {
            "experience_count":     len(parsed.get("experience", [])),
            "project_count":        len(parsed.get("projects", [])),
            "certification_count":  len(parsed.get("certifications", [])),
            "education_count":      len(parsed.get("education", [])),
            "has_skills_section":   bool(parsed.get("skills_section")),
        },
    }


class _NoJDMatchResult:
    """Placeholder when no JD is provided."""
    def __init__(self, score: int, skills: List):
        self.match_score          = score
        self.skills_match_pct     = float(score)
        self.experience_match_pct = 0.0
        self.keyword_match_pct    = 0.0
        self.matched_skills       = [s.name for s in skills]
        self.missing_skills       = []
        self.skill_gaps           = []
        self.partial_matches      = []


# ─────────────────────────────────────────────────────────────────────────────
# FASTAPI SERVER
# ─────────────────────────────────────────────────────────────────────────────

if _FASTAPI_AVAILABLE:
    app = FastAPI(
        title="Resume Analyzer API",
        description="Hybrid resume parsing + job matching service",
        version="2.0.0",
    )

    class AnalyzeRequest(BaseModel):
        resume_text:     str
        job_title:       Optional[str] = ""
        job_description: Optional[str] = ""

    @app.post("/analyze")
    def analyze_endpoint(req: AnalyzeRequest):
        if not req.resume_text or len(req.resume_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="resume_text is too short or empty.")
        try:
            result = analyze(
                resume_text     = req.resume_text,
                job_title       = req.job_title or "",
                job_description = req.job_description or "",
            )
            return {"success": True, "data": result}
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    @app.get("/health")
    def health():
        return {"status": "ok", "version": "2.0.0"}


# ─────────────────────────────────────────────────────────────────────────────
# STANDALONE RUNNER
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse, pathlib

    parser = argparse.ArgumentParser(description="Resume Analyzer")
    parser.add_argument("--resume",  type=str, default="",  help="Path to resume text file")
    parser.add_argument("--title",   type=str, default="",  help="Target job title")
    parser.add_argument("--jd",      type=str, default="",  help="Path to job description text file or inline text")
    parser.add_argument("--serve",   action="store_true",    help="Start FastAPI server on port 8001")
    args = parser.parse_args()

    if args.serve:
        if _FASTAPI_AVAILABLE:
            import uvicorn as uv
            print("Starting Resume Analyzer API on http://0.0.0.0:8001")
            uv.run("main:app", host="0.0.0.0", port=8001, reload=False)
        else:
            print("ERROR: FastAPI / uvicorn not installed. Run: pip install fastapi uvicorn")
        sys.exit(0)

    # Read resume
    resume_text = ""
    if args.resume:
        p = pathlib.Path(args.resume)
        if p.exists():
            resume_text = p.read_text(encoding="utf-8", errors="ignore")
        else:
            print(f"File not found: {args.resume}"); sys.exit(1)

    if not resume_text:
        # Use built-in sample if no file provided
        sample_path = pathlib.Path(__file__).parent.parent / "sample-resume.txt"
        if sample_path.exists():
            resume_text = sample_path.read_text(encoding="utf-8", errors="ignore")
            print(f"[INFO] Using sample resume: {sample_path}")
        else:
            print("No resume provided. Use --resume path/to/resume.txt")
            sys.exit(1)

    # Read JD
    jd_text = ""
    if args.jd:
        p = pathlib.Path(args.jd)
        if p.exists():
            jd_text = p.read_text(encoding="utf-8", errors="ignore")
        else:
            jd_text = args.jd  # treat as inline text

    result = analyze(resume_text, job_title=args.title, job_description=jd_text)

    print("\n" + "=" * 65)
    print("  RESUME ANALYSIS RESULT")
    print("=" * 65)
    print(f"\n  Match Score : {result['match_score']} / 100")
    print(f"  Breakdown   :")
    print(f"    Skills Match     : {result['breakdown']['skills_match']:.1f}%")
    print(f"    Experience Match : {result['breakdown']['experience_match']:.1f}%")
    print(f"    Keyword Match    : {result['breakdown']['keyword_match']:.1f}%")

    print(f"\n  Extracted Skills ({len(result['extracted_skills'])}):")
    for s in result["extracted_skills"][:20]:
        bar = "█" * (s["level"] // 10) + "░" * (10 - s["level"] // 10)
        print(f"    {s['name']:<28} [{bar}]  {s['level']}%  ({s['category']})")

    if result["matched_skills"]:
        print(f"\n  ✅ Matched JD Skills : {', '.join(result['matched_skills'][:10])}")

    if result["missing_skills"]:
        print(f"\n  ⚠️  Missing Skills    : {', '.join(result['missing_skills'][:8])}")

    if result["skill_gaps"]:
        print(f"\n  🔴 Skill Gaps:")
        for gap in result["skill_gaps"][:5]:
            print(f"    [{gap['priority']}] {gap['skill']}")
            print(f"       → {gap['recommendation'][:90]}...")

    if result["partial_matches"]:
        print(f"\n  ≈  Partial Matches   :")
        for p in result["partial_matches"][:3]:
            print(f"    {p['group']}: {', '.join(str(s) for s in p['resume_skills'])}")

    print("\n  Resume Sections:")
    rs = result["resume_sections"]
    print(f"    Experience entries : {rs['experience_count']}")
    print(f"    Projects           : {rs['project_count']}")
    print(f"    Certifications     : {rs['certification_count']}")
    print(f"    Education entries  : {rs['education_count']}")
    print(f"    Skills section     : {'Yes' if rs['has_skills_section'] else 'No'}")

    print("\n" + "=" * 65)
    print("  Full JSON output saved to: analysis_result.json")
    print("=" * 65 + "\n")

    with open("analysis_result.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
