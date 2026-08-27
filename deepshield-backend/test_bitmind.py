import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("BITMIND_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "BITMIND_API_KEY not found. Check your .env file."
    )

IMAGE_PATH = "test.jpg"


url = "https://api.bitmind.ai/detect-image"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}


with open(IMAGE_PATH, "rb") as image_file:
    files = {
        "image": (
            os.path.basename(IMAGE_PATH),
            image_file,
            "image/jpeg"
        )
    }

    response = requests.post(
        url,
        headers=headers,
        files=files,
        timeout=60
    )


print("Status:", response.status_code)
print()
print("Response:")

try:
    print(response.json())
except Exception:
    print(response.text)
