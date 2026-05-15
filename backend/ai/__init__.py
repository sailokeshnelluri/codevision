import json
import re
from groq import AsyncGroq
from typing import List, Dict, Any
from ..config import settings

_groq = AsyncGroq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 10 else None

print(f"DEBUG: Groq client initialized: {_groq is not None}")

TRACE_SYSTEM_PROMPT = """You are CodeVision's execution tracer. Analyze code and return ONLY a valid JSON array. No markdown, no explanation, just the JSON array.

CRITICAL RULES:
- Return ONLY a JSON array starting with [ and ending with ]
- Every step MUST have variables with actual values
- NEVER return empty variables {} after line 1
- Track every variable change carefully

Example of CORRECT step:
{
  "line": 11,
  "code": "int x = 5;",
  "variables": {
    "x": {"value": 5, "type": "int", "changed": true}
  },
  "arrays": {},
  "stack": [{"name": "main", "line": 11}],
  "explanation": "Integer variable x is declared and assigned the value 5.",
  "output": null
}

Example of CORRECT step with multiple variables:
{
  "line": 13,
  "code": "int sum = x + y;",
  "variables": {
    "x": {"value": 5, "type": "int", "changed": false},
    "y": {"value": 10, "type": "int", "changed": false},
    "sum": {"value": 15, "type": "int", "changed": true}
  },
  "arrays": {},
  "stack": [{"name": "main", "line": 13}],
  "explanation": "Variable sum is calculated as x + y which equals 15.",
  "output": null
}

RULES:
- Include ALL variables seen so far in every step
- Mark changed:true only for variables changed in THIS step
- For arrays use arrays field: {"numbers": {"values": [1,2,3], "active_index": 0}}
- For function calls add to stack: [{"name": "main", "line": 10}, {"name": "factorial", "line": 3}]
- output field contains print/println/cout output or null
- Generate 10-25 steps for typical programs
- Skip blank lines and comment lines
- For loops generate one step per iteration"""


async def generate_trace(code: str, language: str) -> List[Dict[str, Any]]:
    if not _groq:
        print("DEBUG: No Groq client, using fallback")
        return _fallback_trace(code)

    try:
        print(f"DEBUG: Calling Groq API for {language} code")
        response = await _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=4000,
            messages=[
                {"role": "system", "content": TRACE_SYSTEM_PROMPT},
                {"role": "user", "content": f"Language: {language}\n\nGenerate execution trace with variables for every step:\n{code}"}
            ],
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        print(f"DEBUG: Groq response length: {len(raw)}")
        print(f"DEBUG: First 300 chars: {raw[:300]}")

        raw = re.sub(r'^```json?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)
        raw = raw.strip()

        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            parsed = parsed.get("steps", list(parsed.values())[0] if parsed else [])

        print(f"DEBUG: Parsed {len(parsed)} steps")
        if parsed:
            print(f"DEBUG: First step variables: {parsed[0].get('variables', {})}")
            print(f"DEBUG: Second step variables: {parsed[1].get('variables', {}) if len(parsed) > 1 else 'N/A'}")

        return parsed if isinstance(parsed, list) else []

    except json.JSONDecodeError as e:
        print(f"DEBUG: JSON parse error: {e}")
        print(f"DEBUG: Raw response: {raw[:500]}")
        match = re.search(r'\[[\s\S]*\]', raw)
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                pass
        return _fallback_trace(code)
    except Exception as e:
        print(f"DEBUG: Groq error: {e}")
        return _fallback_trace(code)


def _fallback_trace(code: str) -> List[Dict[str, Any]]:
    lines = [l for l in code.split('\n') if l.strip() and not l.strip().startswith('//') and not l.strip().startswith('#')]
    return [
        {
            "line": i + 1,
            "code": line.strip(),
            "variables": {},
            "arrays": {},
            "stack": [{"name": "main", "line": i + 1}],
            "explanation": f"Executing: {line.strip()}",
            "output": None,
        }
        for i, line in enumerate(lines[:20])
    ]


async def explain_line(code: str, language: str, line: int, line_code: str) -> str:
    if not _groq:
        return f"This line executes: {line_code}"
    try:
        response = await _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=300,
            messages=[
                {"role": "system", "content": "You are a friendly coding tutor. Explain code in simple beginner-friendly English in 2-3 sentences."},
                {"role": "user", "content": f"Language: {language}\nCode:\n{code}\n\nExplain line {line}: `{line_code}`"}
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Explain error: {e}")
        return f"This line executes: {line_code}"


async def explain_code_overview(code: str, language: str) -> str:
    if not _groq:
        return "This code performs a computation and produces output."
    try:
        response = await _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=300,
            messages=[
                {"role": "system", "content": "You are a friendly coding tutor. Explain code clearly and simply in 2-3 sentences."},
                {"role": "user", "content": f"Explain this {language} code in 2-3 beginner-friendly sentences:\n{code}"}
            ],
        )
        return response.choices[0].message.content
    except Exception:
        return "This code performs a computation and produces output."