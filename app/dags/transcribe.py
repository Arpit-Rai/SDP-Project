# dags/youtube_transcriber_dag.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import os

# Set default arguments for DAG
default_args = {
    'owner': 'airflow',
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

YOUTUBE_URL = os.getenv("YT_DLP_TEST_URL", "https://www.youtube.com/watch?v=dQw4w9WgXcQ")

def download_audio(**kwargs):
    from app.services.downloader import download_audio_from_youtube
    filepath = download_audio_from_youtube(YOUTUBE_URL)
    kwargs['ti'].xcom_push(key='audio_path', value=filepath)

def transcribe(**kwargs):
    from app.services.transcriber import transcribe_audio
    audio_path = kwargs['ti'].xcom_pull(key='audio_path')
    transcript = transcribe_audio(audio_path)
    kwargs['ti'].xcom_push(key='transcript', value=transcript)

def summarize(**kwargs):
    from app.services.summarizer import summarize_text
    transcript = kwargs['ti'].xcom_pull(key='transcript')
    summary = summarize_text(transcript)
    kwargs['ti'].xcom_push(key='summary', value=summary)

def generate_posts(**kwargs):
    from app.services.generator import generate_social_posts
    summary = kwargs['ti'].xcom_pull(key='summary')
    posts = generate_social_posts(summary)
    print("Generated Social Media Posts:\n", posts)

t1 = PythonOperator(
    task_id='download_audio',
    python_callable=download_audio,
    provide_context=True,
    dag=dag
)

t2 = PythonOperator(
    task_id='transcribe_audio',
    python_callable=transcribe,
    provide_context=True,
    dag=dag
)

t3 = PythonOperator(
    task_id='summarize_transcript',
    python_callable=summarize,
    provide_context=True,
    dag=dag
)

t4 = PythonOperator(
    task_id='generate_social_posts',
    python_callable=generate_posts,
    provide_context=True,
    dag=dag
)

t1 >> t2 >> t3 >> t4