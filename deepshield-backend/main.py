import os
import shutil
import tempfile
import time
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend dir, then the repo root as fallback, so the
# app works whether keys live next to main.py or in the workspace root
# (e.g. the Freebuff workspace .env). Already-set vars are not overridden.
_BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_BACKEND_DIR.parent / ".env")

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
)

from fastapi.middleware.cors import CORSMiddleware

from utils.media import get_media_type
from services.analyzer import analyze_file


app = FastAPI(
    title="DeepShield API",
    version="1.0.1",
)


# CORS: configurable via CORS_ORIGINS (comma-separated). Falls back to
# sensible local-development defaults when unset.
_cors_origins = os.getenv("CORS_ORIGINS", "")

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in _cors_origins.split(",")
    if origin.strip()
] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,

    allow_origins=ALLOWED_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# Upload size cap (bytes). Prevents huge payloads from eating memory and
# provider bandwidth before any analysis starts.
MAX_UPLOAD_MB = float(os.getenv("MAX_UPLOAD_MB", "100"))
MAX_UPLOAD_BYTES = int(MAX_UPLOAD_MB * 1024 * 1024)


@app.get("/")
def root():
    return {
        "service": "DeepShield API",
        "status": "online",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...)
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided",
        )

    media_type = get_media_type(
        file.filename
    )

    if media_type == "unknown":
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Supported: image, video, audio."
            ),
        )

    start_time = time.time()

    # Keep only a short, safe extension for the temp file so odd or
    # malicious filenames can never escape the temp directory.
    raw_suffix = os.path.splitext(file.filename)[1]
    suffix = raw_suffix if 0 < len(raw_suffix) <= 10 else ".bin"

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:

            temp_path = temp_file.name

            bytes_written = 0

            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                bytes_written += len(chunk)

                if bytes_written > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=(
                            f"File too large. Maximum is "
                            f"{MAX_UPLOAD_MB:g} MB."
                        ),
                    )

                temp_file.write(chunk)

        result = await analyze_file(
            file_path=temp_path,
            filename=file.filename,
            media_type=media_type,
        )

        analysis_time = (
            time.time() - start_time
        )

        result["filename"] = file.filename

        result["analysis_time"] = round(
            analysis_time,
            2,
        )

        return result

    except HTTPException:

        # Client errors (4xx) must reach the browser as-is, not be
        # repackaged as a generic 500.
        raise

    except Exception as error:

        print(
            "ANALYSIS ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Analysis failed: {str(error)}"
            ),
        )

    finally:

        if (
            temp_path
            and os.path.exists(temp_path)
        ):
            os.remove(temp_path)
