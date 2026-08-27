import mimetypes


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".avif",
}

VIDEO_EXTENSIONS = {
    ".mp4",
    ".webm",
    ".mov",
    ".avi",
    ".mkv",
}

AUDIO_EXTENSIONS = {
    ".mp3",
    ".wav",
    ".m4a",
    ".aac",
    ".ogg",
    ".flac",
    ".alac",
}


def get_media_type(filename: str) -> str:
    filename = filename.lower()

    for extension in IMAGE_EXTENSIONS:
        if filename.endswith(extension):
            return "image"

    for extension in VIDEO_EXTENSIONS:
        if filename.endswith(extension):
            return "video"

    for extension in AUDIO_EXTENSIONS:
        if filename.endswith(extension):
            return "audio"

    mime_type, _ = mimetypes.guess_type(filename)

    if mime_type:
        if mime_type.startswith("image/"):
            return "image"

        if mime_type.startswith("video/"):
            return "video"

        if mime_type.startswith("audio/"):
            return "audio"

    return "unknown"
