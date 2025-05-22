import whisper

model = whisper.load_model("base")  # You can choose: tiny, base, small, medium, large

def transcribe_audio(audio_path: str) -> str:
    """
    Transcribes the given audio file using Whisper.
    Returns the full transcript as a string.
    """
    result = model.transcribe(audio_path)
    transcript = result["text"]
    return transcript