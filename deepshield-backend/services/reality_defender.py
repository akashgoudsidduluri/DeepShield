import os

from realitydefender import RealityDefender


async def analyze_audio(file_path: str) -> dict:
    api_key = os.getenv("REALITY_DEFENDER_API_KEY")

    if not api_key:
        raise RuntimeError(
            "REALITY_DEFENDER_API_KEY is not configured"
        )

    rd = RealityDefender(api_key=api_key)

    try:
        upload_response = await rd.upload(
            file_path=file_path
        )

        request_id = upload_response["request_id"]

        result = await rd.get_result(request_id)

        return result

    finally:
        await rd.cleanup()
