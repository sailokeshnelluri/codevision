from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, validator
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..database import get_db
from ..models import User, ExecutionHistory
from ..auth import get_current_user
from ..execution_engine.judge0 import submit_code
from ..ai import generate_trace, explain_line, explain_code_overview
from ..config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

ALLOWED_LANGUAGES = {"python", "javascript", "c", "cpp", "java"}
MAX_CODE_LENGTH = 10_000  # characters


class RunCodeRequest(BaseModel):
    code: str
    language: str

    @validator("language")
    def validate_language(cls, v):
        if v.lower() not in ALLOWED_LANGUAGES:
            raise ValueError(f"Language must be one of: {', '.join(ALLOWED_LANGUAGES)}")
        return v.lower()

    @validator("code")
    def validate_code(cls, v):
        if not v.strip():
            raise ValueError("Code cannot be empty")
        if len(v) > MAX_CODE_LENGTH:
            raise ValueError(f"Code exceeds maximum length of {MAX_CODE_LENGTH} characters")
        return v


class VisualizeRequest(BaseModel):
    code: str
    language: str

    @validator("language")
    def validate_language(cls, v):
        if v.lower() not in ALLOWED_LANGUAGES:
            raise ValueError(f"Language must be one of: {', '.join(ALLOWED_LANGUAGES)}")
        return v.lower()

    @validator("code")
    def validate_code(cls, v):
        if not v.strip():
            raise ValueError("Code cannot be empty")
        if len(v) > MAX_CODE_LENGTH:
            raise ValueError(f"Code exceeds {MAX_CODE_LENGTH} characters")
        return v


class ExplainRequest(BaseModel):
    code: str
    language: str
    line: Optional[int] = None
    context: Optional[str] = None  # the specific line code


# ─── /run-code ───────────────────────────────────────────────────────────────
@router.post("/run-code")
@limiter.limit(settings.RATE_LIMIT_RUN_CODE)
async def run_code(
    request: Request,
    body: RunCodeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Execute code via Judge0 and return raw stdout/stderr.
    Does NOT generate visualization steps.
    """
    try:
        result = await submit_code(body.code, body.language)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Execution service error: {str(e)}")

    # Log execution history
    history = ExecutionHistory(
        user_id=user.id,
        code=body.code,
        language=body.language,
        output=result.get("stdout", ""),
        error=result.get("error", ""),
        execution_time=str(result.get("exec_time", "")),
        steps_count=0,
    )
    db.add(history)

    return {
        "stdout":    result.get("stdout", ""),
        "stderr":    result.get("stderr", ""),
        "error":     result.get("error", ""),
        "exec_time": result.get("exec_time"),
        "status":    result.get("status"),
        "success":   result.get("success", False),
    }


# ─── /visualize ──────────────────────────────────────────────────────────────
@router.post("/visualize")
@limiter.limit(settings.RATE_LIMIT_RUN_CODE)
async def visualize(
    request: Request,
    body: VisualizeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Execute code AND generate AI-powered step-by-step visualization trace.
    This is the main endpoint used by the playground.
    """
    # 1. Run the code via Judge0 to get real output
    exec_result = {"stdout": "", "error": "", "exec_time": None, "success": True}
    if settings.JUDGE0_API_KEY:
        try:
            exec_result = await submit_code(body.code, body.language)
        except Exception as e:
            # Don't fail the whole request if Judge0 is unavailable
            exec_result["error"] = f"Execution service unavailable: {str(e)}"

    # 2. Generate AI visualization trace
    try:
        steps = await generate_trace(body.code, body.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trace generation failed: {str(e)}")

    if not steps:
        raise HTTPException(status_code=500, detail="Could not generate execution trace")

    # 3. Inject real stdout output into relevant steps
    if exec_result.get("stdout"):
        output_lines = exec_result["stdout"].strip().split("\n")
        output_idx = 0
        for step in steps:
            if step.get("output") and output_idx < len(output_lines):
                step["output"] = output_lines[output_idx]
                output_idx += 1

    # 4. Save execution history
    history = ExecutionHistory(
        user_id=user.id,
        code=body.code,
        language=body.language,
        output=exec_result.get("stdout", ""),
        error=exec_result.get("error", ""),
        execution_time=str(exec_result.get("exec_time", "")),
        steps_count=len(steps),
    )
    db.add(history)

    return {
        "steps":     steps,
        "output":    exec_result.get("stdout", ""),
        "error":     exec_result.get("error", ""),
        "exec_time": exec_result.get("exec_time"),
        "success":   exec_result.get("success", True),
        "step_count": len(steps),
    }


# ─── /explain ────────────────────────────────────────────────────────────────
@router.post("/explain")
@limiter.limit(settings.RATE_LIMIT_EXPLAIN)
async def explain(
    request: Request,
    body: ExplainRequest,
    user: User = Depends(get_current_user),
):
    """
    Generate a deep AI explanation for a specific line or the whole code.
    """
    try:
        if body.line and body.context:
            # Explain a specific line in detail
            explanation = await explain_line(
                body.code,
                body.language,
                body.line,
                body.context,
            )
        else:
            # Explain the whole code
            explanation = await explain_code_overview(body.code, body.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation failed: {str(e)}")

    return {"explanation": explanation}
