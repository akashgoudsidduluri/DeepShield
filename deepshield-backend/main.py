import os
import shutil
import tempfile
import time

from dotenv import load_dotenv

load_dotenv()

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
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


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

    suffix = os.path.splitext(
        file.filename
    )[1]

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:

            temp_path = temp_file.name

            shutil.copyfileobj(
                file.file,
                temp_file,
            )

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
