from __future__ import annotations

import logging
import os
import re
import time

from realitydefender import RealityDefender

logger = logging.getLogger(__name__)


_POSITIVE_INT_RE = re.compile(r"^[1-9]\d*$")

# These defaults preserve the application's existing behavior. The SDK's own
# defaults are 2000ms / 30 attempts (~60s window), but audio analysis routinely
# takes longer, so this app intentionally extends the window to 150 attempts
# (~5 min) so a valid scan is not abandoned while still in progress.
DEFAULT_POLL_INTERVAL_MS = 2000
DEFAULT_MAX_ATTEMPTS = 150


def _parse_positive_int(value: str | None, name: str, default: int) -> int:
    """Parse a required-positive integer configuration value.

    Returns the parsed value, or `default` when the environment variable is
    unset. Raises `RuntimeError` for present but invalid values so that bad
    configuration is rejected early and explicitly.
    """
    if value is None:
        return default

    if not _POSITIVE_INT_RE.match(value):
        raise RuntimeError(
            f"Invalid {name}: {value!r}. "
            f"Expected a positive integer (for example {default})."
        )

    parsed = int(value)
    if parsed <= 0:
        raise RuntimeError(
            f"Invalid {name}: {value!r}. Must be a positive integer."
        )

    return parsed


def load_polling_config() -> dict[str, int]:
    """Load and validate Reality Defender polling configuration from env.

    Defaults preserve this application's existing behavior: polling every
    2000ms with up to 150 attempts. (The SDK's own default is 30 attempts.)
    """
    polling_interval_ms = _parse_positive_int(
        os.getenv("RD_POLL_INTERVAL_MS"),
        "RD_POLL_INTERVAL_MS",
        DEFAULT_POLL_INTERVAL_MS,
    )

    max_attempts = _parse_positive_int(
        os.getenv("RD_POLL_MAX_ATTEMPTS"),
        "RD_POLL_MAX_ATTEMPTS",
        DEFAULT_MAX_ATTEMPTS,
    )

    return {
        "polling_interval_ms": polling_interval_ms,
        "max_attempts": max_attempts,
    }


def _now_ms() -> float:
    return time.perf_counter() * 1000.0


def _log_stage(stage: str, start_ms: float, end_ms: float, file_basename: str) -> None:
    """Log a stage duration without credentials, media bytes, or user data."""
    logger.info(
        "reality_defender %s took %.0f ms for %s",
        stage,
        end_ms - start_ms,
        file_basename,
    )


async def analyze_audio(file_path: str) -> dict:
    api_key = os.getenv("REALITY_DEFENDER_API_KEY")

    if not api_key:
        raise RuntimeError(
            "REALITY_DEFENDER_API_KEY is not configured"
        )

    config = load_polling_config()

    rd = RealityDefender(api_key=api_key)

    t_upload_start = _now_ms()

    try:
        upload_response = await rd.upload(
            file_path=file_path
        )
    finally:
        await rd.cleanup()

    t_upload_end = _now_ms()
    _log_stage(
        "upload",
        t_upload_start,
        t_upload_end,
        os.path.basename(file_path),
    )

    request_id = upload_response["request_id"]

    t_result_start = _now_ms()

    result = await rd.get_result(
        request_id,
        max_attempts=config["max_attempts"],
        polling_interval=config["polling_interval_ms"],
    )

    t_result_end = _now_ms()
    _log_stage(
        "poll",
        t_result_start,
        t_result_end,
        os.path.basename(file_path),
    )

    logger.info(
        "reality_defender total %.0f ms for %s",
        t_result_end - t_upload_start,
        os.path.basename(file_path),
    )

    return result
