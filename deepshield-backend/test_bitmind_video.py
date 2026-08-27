import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("BITMIND_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "BITMIND_API_KEY not found in .env"
    )

VIDEO_PATH = "test_ai.mp4"

if not os.path.exists(VIDEO_PATH):
    raise FileNotFoundError(
        f"Video not found: {VIDEO_PATH}"
    )

file_size_mb = os.path.getsize(VIDEO_PATH) / (1024 * 1024)

print(f"Video size: {file_size_mb:.2f} MB")

if file_size_mb > 10:
    raise ValueError(
        "Video is over BitMind's 10 MB direct upload limit."
    )


url = "https://api.bitmind.ai/detect-video"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}


with open(VIDEO_PATH, "rb") as video_file:

    files = {
        "video": (
            os.path.basename(VIDEO_PATH),
            video_file,
            "video/mp4"
        )
    }

    response = requests.post(
        url,
        headers=headers,
        files=files,
        timeout=180
    )


print()
print("Status:", response.status_code)
print()
print("Response:")

try:
    print(response.json())
except Exception:
    print(response.text)
