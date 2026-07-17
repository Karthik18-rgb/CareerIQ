"""
Gemini AI service for comprehensive resume analysis.
Produces ATS score, missing skills, suggestions, cover letter,
interview questions, strengths/weaknesses, keyword suggestions,
career suggestions, learning roadmap, and skill gap analysis.
"""

import json
import logging
from typing import Any, Dict, List, Tuple

import google.generativeai as genai

from app.config.settings import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel(settings.GEMINI_MODEL)

SYSTEM_PROMPT = """You are an expert ATS analyst, career coach, and HR strategist.
Analyse the provided RESUME against the JOB DESCRIPTION and return ONLY valid JSON with these keys:

1. `ats_score` — float 0-100 overall match.
2. `ats_breakdown` — object with:
   - `keyword_match` (0-100)
   - `skills_alignment` (0-100)
   - `experience_relevance` (0-100)
   - `format_quality` (0-100)
   - `strengths` — list of 2-3 resume strengths
   - `weaknesses` — list of 2-3 resume weaknesses
   - `keyword_suggestions` — list of 5-10 keywords to add
3. `missing_skills` — list of important skills from the JD absent/weak in the resume.
4. `resume_suggestions` — list of 5 actionable improvement tips.
5. `cover_letter` — full professional cover letter (3-4 paragraphs).
6. `interview_questions` — list of 5 likely interview questions.
7. `hr_questions` — list of 3 HR-specific questions.
8. `technical_questions` — list of 3 role-specific technical questions.
9. `career_suggestions` — list of 3 career growth suggestions.
10. `learning_roadmap` — list of 5 learning steps to close the skill gap.
11. `skill_gap_analysis` — string summarising the gap between current and required skills.

Return ONLY valid JSON. No markdown, no code fences."""


def _build_prompt(resume_text: str, job_title: str, company: str, job_description: str) -> str:
    parts = [SYSTEM_PROMPT, "\n\n--- JOB DETAILS ---"]
    if job_title:
        parts.append(f"Job Title: {job_title}")
    if company:
        parts.append(f"Company: {company}")
    parts.extend([
        f"\n--- JOB DESCRIPTION ---\n{job_description}",
        f"\n--- RESUME ---\n{resume_text}",
    ])
    return "\n".join(parts)


def _clean_json(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0].strip()
    if raw.startswith("json"):
        raw = raw[4:].strip()
    return raw


def analyse_resume(
    resume_text: str,
    job_title: str = "",
    company: str = "",
    job_description: str = "",
) -> Tuple[float, Dict[str, Any], List[str], List[str], str, List[str], List[str], List[str], List[str], List[str], str]:
    """
    Full AI analysis returning all 11 result fields.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured. Set it in your .env file.")

    prompt = _build_prompt(resume_text, job_title, company, job_description)

    try:
        logger.info("Gemini prompt length=%d chars", len(prompt))
        response = model.generate_content(prompt)
        raw = _clean_json(response.text)
        data = json.loads(raw)

        ats_score = float(data.get("ats_score", 0))
        ats_breakdown = data.get("ats_breakdown", {})
        missing_skills = data.get("missing_skills", [])
        resume_suggestions = data.get("resume_suggestions", [])
        cover_letter = data.get("cover_letter", "")
        interview_questions = data.get("interview_questions", [])
        hr_questions = data.get("hr_questions", [])
        technical_questions = data.get("technical_questions", [])
        career_suggestions = data.get("career_suggestions", [])
        learning_roadmap = data.get("learning_roadmap", [])
        skill_gap_analysis = data.get("skill_gap_analysis", "")

        logger.info("ATS=%.1f skills=%d questions=%d", ats_score, len(missing_skills), len(interview_questions))

        return (
            ats_score, ats_breakdown, missing_skills, resume_suggestions,
            cover_letter, interview_questions, hr_questions, technical_questions,
            career_suggestions, learning_roadmap, skill_gap_analysis,
        )
    except json.JSONDecodeError as e:
        logger.error("Gemini JSON error: %s — raw: %s", e, raw[:300])
        raise ValueError("AI returned an invalid format. Try again.")
    except Exception as e:
        logger.error("Gemini API error: %s", str(e))
        raise ValueError(f"AI analysis failed: {str(e)}")
