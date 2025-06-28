# dags/transcribe.py
import os
import sys
from pathlib import Path
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

# Adding the project root to Python path so we can import from app/
# This is necessary because Airflow runs from /opt/airflow/ inside the container
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Set default arguments for DAG
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'youtube_transcriber_pipeline',
    default_args=default_args,
    description='Pipeline to download, transcribe, summarize and generate posts for a YouTube video',
    schedule_interval=None,
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['youtube', 'transcription', 'ai']
)

# Get YouTube URL from environment variable
YOUTUBE_URL = os.getenv("YT_DLP_TEST_URL", "https://www.youtube.com/watch?v=dQw4w9WgXcQ")

def download_audio(ti, **kwargs):
    """Download audio from YouTube URL"""
    try:
        # Import inside function to avoid import issues at DAG parsing time
        from app.services.downloader import download_audio_from_youtube
        
        print(f"Downloading audio from: {YOUTUBE_URL}")
        filepath = download_audio_from_youtube(YOUTUBE_URL)
        print(f"Audio downloaded to: {filepath}")
        
        # Push filepath to XCom for next task
        ti.xcom_push(key='audio_path', value=filepath)
        return filepath
        
    except Exception as e:
        print(f"Error downloading audio: {str(e)}")
        raise

def transcribe_audio_task(ti, **kwargs):
    """Transcribe downloaded audio file"""
    try:
        from app.services.transcriber import transcribe_audio
        
        # Get audio path from previous task
        audio_path = ti.xcom_pull(key='audio_path', task_ids='download_audio')
        if not audio_path:
            raise ValueError("No audio path received from download task")
            
        print(f"Transcribing audio from: {audio_path}")
        transcript = transcribe_audio(audio_path)
        print(f"Transcription completed. Length: {len(transcript)} characters")
        
        # Push transcript to XCom for next task
        ti.xcom_push(key='transcript', value=transcript)
        return transcript
        
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        raise

def summarize_transcript(ti, **kwargs):
    """Summarize the transcribed text"""
    try:
        from app.services.summarizer import summarize_text
        
        # Getting transcript from previous task
        transcript = ti.xcom_pull(key='transcript', task_ids='transcribe_audio')
        if not transcript:
            raise ValueError("No transcript received from transcribe task")
            
        print(f"Summarizing transcript of {len(transcript)} characters")
        summary = summarize_text(transcript)
        print(f"Summary generated. Length: {len(summary)} characters")
        
        # Pushing summary to XCom for next task
        ti.xcom_push(key='summary', value=summary)
        return summary
        
    except Exception as e:
        print(f"Error summarizing text: {str(e)}")
        raise

def generate_social_posts(ti, **kwargs):
    """Generate social media posts from summary"""
    try:
        from app.services.generator import generate_social_posts
        
        # Getting summary from the previous task
        summary = ti.xcom_pull(key='summary', task_ids='summarize_transcript')
        if not summary:
            raise ValueError("No summary received from summarize task")
            
        print(f"Generating social posts from summary")
        posts = generate_social_posts(summary)
        print("Generated Social Media Posts:")
        print("=" * 50)
        print(posts)
        print("=" * 50)
        
        # Optionally we can push posts to XCom for potential downstream tasks
        ti.xcom_push(key='social_posts', value=posts)
        return posts
        
    except Exception as e:
        print(f"Error generating social posts: {str(e)}")
        raise

# Defining tasks
download_task = PythonOperator(
    task_id='download_audio',
    python_callable=download_audio,
    dag=dag,
    doc_md="""
    ## Download Audio Task
    Downloads audio from the specified YouTube URL using yt-dlp.
    """
)

transcribe_task = PythonOperator(
    task_id='transcribe_audio',
    python_callable=transcribe_audio_task,
    dag=dag,
    doc_md="""
    ## Transcribe Audio Task
    Transcribes the downloaded audio file to text using speech recognition.
    """
)

summarize_task = PythonOperator(
    task_id='summarize_transcript',
    python_callable=summarize_transcript,
    dag=dag,
    doc_md="""
    ## Summarize Transcript Task
    Creates a summary of the transcribed text using AI/NLP services.
    """
)

generate_posts_task = PythonOperator(
    task_id='generate_social_posts',
    python_callable=generate_social_posts,
    dag=dag,
    doc_md="""
    ## Generate Social Posts Task
    Generates social media posts based on the summary of the content.
    """
)

# Defining task dependencies
download_task >> transcribe_task >> summarize_task >> generate_posts_task