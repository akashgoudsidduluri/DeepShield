import os

from realitydefender import RealityDefender


async def analyze_audio(file_path: str) -> dict:
    api_key = os.getenv("REALITY_DEFENDER_API_KEY")

    if not api_key:
        raise RuntimeError(
            "REALITY_DEFENDER_API_KEY is not configured"
        )

    rd = RealityDefender(api_key=api_key)

    # Audio analysis on Reality Defender routinely takes minutes; the SDK
    # default poll window is only ~60s (30 attempts x 2s), which gives up
    # while the scan is still running. Allow it to finish.
    max_attempts = int(os.getenv("RD_POLL_MAX_ATTEMPTS", "150"))
    polling_interval = int(os.getenv("RD_POLL_INTERVAL_MS", "2000"))

    try:
        upload_response = await rd.upload(
            file_path=file_path
        )

        request_id = upload_response["request_id"]

        result = await rd.get_result(
            request_id,
            max_attempts=max_attempts,
            polling_interval=polling_interval,
        )

        return result

    finally:
        await rd.cleanup()
