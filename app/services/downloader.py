import os
from yt_dlp import YoutubeDL
from moviepy.editor import AudioFileClip

def download_youtube_audio(url: str, download_dir: str = "downloads") -> str:
    if not os.path.exists(download_dir):
        os.makedirs(download_dir)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(download_dir, '%(title)s.%(ext)s'),
        'quiet': True
    }

    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
    except Exception as e:
        raise RuntimeError(f"Failed to download video: {str(e)}")

    audio_path = filename.rsplit('.', 1)[0] + '.wav'

    try:
        with AudioFileClip(filename) as clip:
            clip.write_audiofile(audio_path)
        os.remove(filename)
    except Exception as e:
        raise RuntimeError(f"Failed to convert to audio: {str(e)}")

    return audio_path