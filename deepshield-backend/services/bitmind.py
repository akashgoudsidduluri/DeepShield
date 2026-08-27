import os
import mimetypes
import requests


BITMIND_IMAGE_URL = "https://api.bitmind.ai/detect-image"
BITMIND_VIDEO_URL = "https://api.bitmind.ai/detect-video"


def get_headers():
    api_key = os.getenv("BITMIND_API_KEY")

    if not api_key:
        raise RuntimeError("BITMIND_API_KEY is not configured")

    return {
        "Authorization": f"Bearer {api_key}"
    }


def analyze_image(file_path: str, filename: str) -> dict:
    mime_type = (
        mimetypes.guess_type(filename)[0]
        or "application/octet-stream"
    )

    with open(file_path, "rb") as file:
        files = {
            "image": (
                filename,
                file,
                mime_type,
            )
        }

        response = requests.post(
            BITMIND_IMAGE_URL,
            headers=get_headers(),
            files=files,
            timeout=120,
        )

    response.raise_for_status()
    return response.json()


def analyze_video(file_path: str, filename: str) -> dict:
    mime_type = (
        mimetypes.guess_type(filename)[0]
        or "video/mp4"
    )

    with open(file_path, "rb") as file:
        files = {
            "video": (
                filename,
                file,
                mime_type,
            )
        }

        response = requests.post(
            BITMIND_VIDEO_URL,
            headers=get_headers(),
            files=files,
            timeout=300,
        )

    response.raise_for_status()
    return response.json()
