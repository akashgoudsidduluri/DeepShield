import os
import asyncio
from dotenv import load_dotenv
from realitydefender import RealityDefender

load_dotenv()

API_KEY = os.getenv("REALITY_DEFENDER_API_KEY")
AUDIO_PATH = "test_audai.mp3"


async def main():
    if not API_KEY:
        raise RuntimeError(
            "REALITY_DEFENDER_API_KEY not found in .env"
        )

    if not os.path.exists(AUDIO_PATH):
        raise FileNotFoundError(
            f"Audio file not found: {AUDIO_PATH}"
        )

    file_size_mb = os.path.getsize(AUDIO_PATH) / (1024 * 1024)

    print(f"Audio file: {AUDIO_PATH}")
    print(f"Size: {file_size_mb:.2f} MB")
    print("Initializing Reality Defender...")

    rd = RealityDefender(api_key=API_KEY)

    try:
        print("\nUploading audio for analysis...")

        upload_response = await rd.upload(
            file_path=AUDIO_PATH
        )

        print("Upload response:")
        print(upload_response)

        request_id = upload_response["request_id"]

        print(f"\nRequest ID: {request_id}")
        print("Waiting for analysis result...")

        result = await rd.get_result(request_id)

        print("\n========== ANALYSIS COMPLETE ==========")
        print(result)

        print("\n========== SUMMARY ==========")
        print("Status:", result.get("status"))
        print("Score:", result.get("score"))

        models = result.get("models", [])

        if models:
            print("\nModel results:")

            for model in models:
                print(
                    f"- {model.get('name')}: "
                    f"{model.get('status')} "
                    f"(score: {model.get('score')})"
                )

    finally:
        await rd.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
