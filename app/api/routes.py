from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.util import save_uploaded_file
from app.services.downloader import download_youtube_audio
from app.services.transcriber import transcribe_audio
from app.services.summarizer import summarize_text
from app.services.generator import generate_social_posts
from app.models.schemas import ProcessRequest, ProcessResponse
import traceback
from fastapi.middleware.cors import CORSMiddleware

router = APIRouter()

# Request and Response Schemas
class ProcessRequest(BaseModel):
    url: str

class ProcessResponse(BaseModel):
    transcript: str
    summary: str
    social_posts: dict

@router.post("/process", response_model=ProcessResponse)
def process_video(request: ProcessRequest):
    try:
        # Step 1: Download YouTube audio
        audio_path = download_youtube_audio(request.url)

        # Step 2: Transcribe audio
        transcript = transcribe_audio(audio_path)

        # Step 3: Summarize transcript
        summary = summarize_text(transcript)

        # Step 4: Generate social media content
        social_posts = generate_social_posts(summary)

        return {
            "transcript": transcript,
            "summary": summary,
            "social_posts": social_posts
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Save the uploaded file (implement save_uploaded_file in util.py)
        audio_path = save_uploaded_file(file)
        # Process the audio as needed (transcribe, summarize, generate posts)
        transcript = transcribe_audio(audio_path)
        summary = summarize_text(transcript)
        social_posts = generate_social_posts(summary)
        return {
            "audio_src": file.filename,
            "transcript": transcript,
            "summary": summary,
            "social_posts": social_posts,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to process uploaded file")
