import httpx
import asyncio
import base64
from typing import Optional
from ..config import settings

# Judge0 language IDs
LANGUAGE_IDS = {
    "python":     71,   # Python 3.8
    "javascript": 63,   # Node.js 12
    "c":          50,   # C (GCC 9.2)
    "cpp":        54,   # C++ (GCC 9.2)
    "java":       62,   # Java (OpenJDK 13)
}

JUDGE0_HEADERS = {
    "X-RapidAPI-Key":  settings.JUDGE0_API_KEY,
    "X-RapidAPI-Host": settings.JUDGE0_API_HOST,
    "Content-Type":    "application/json",
}


async def submit_code(code: str, language: str, stdin: str = "") -> dict:
    """Submit code to Judge0 and poll for result."""
    lang_id = LANGUAGE_IDS.get(language, 71)

    payload = {
        "source_code": base64.b64encode(code.encode()).decode(),
        "language_id": lang_id,
        "stdin":        base64.b64encode(stdin.encode()).decode() if stdin else "",
        "base64_encoded": True,
        "wait": False,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        # Submit
        res = await client.post(
            f"{settings.JUDGE0_API_URL}/submissions",
            json=payload,
            headers=JUDGE0_HEADERS,
        )
        res.raise_for_status()
        token = res.json()["token"]

        # Poll with backoff
        for attempt in range(15):
            await asyncio.sleep(1 + attempt * 0.5)
            poll = await client.get(
                f"{settings.JUDGE0_API_URL}/submissions/{token}",
                headers=JUDGE0_HEADERS,
                params={"base64_encoded": "true", "fields": "stdout,stderr,compile_output,status,time,memory"},
            )
            poll.raise_for_status()
            data = poll.json()

            status_id = data.get("status", {}).get("id", 0)
            if status_id not in (1, 2):  # 1=In Queue, 2=Processing
                break

    def decode(s: Optional[str]) -> str:
        if not s:
            return ""
        try:
            return base64.b64decode(s).decode("utf-8", errors="replace")
        except Exception:
            return s

    stdout         = decode(data.get("stdout"))
    stderr         = decode(data.get("stderr"))
    compile_output = decode(data.get("compile_output"))
    exec_time      = data.get("time")
    status_desc    = data.get("status", {}).get("description", "Unknown")

    error = ""
    if status_id == 6:   # Compilation error
        error = compile_output
    elif status_id in (5, 11, 12, 13, 14):  # TLE / runtime errors
        error = stderr or status_desc
    elif stderr:
        error = stderr

    return {
        "stdout":      stdout,
        "stderr":      stderr,
        "error":       error,
        "exec_time":   exec_time,
        "status":      status_desc,
        "status_id":   status_id,
        "success":     status_id == 3,
    }
