 # YouTube Content Automation Pipeline

This project automates the entire process of turning a YouTube video into engaging social media content using AI tools. It handles:

1.  Downloading YouTube videos
2.  Extracting and transcribing audio (via Whisper)
3.  Summarizing the transcript (via Facebook/BART)
4.  Generating social media captions (via Ollama + Mistral)
5.  Orchestration via Apache Airflow
6.  Containerization with Docker and Docker Compose

---

## 📦 Tech Stack

| Purpose                | Tool                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Backend Framework      | [FastAPI](https://fastapi.tiangolo.com)                                                       |
| Video Download         | [yt\_dlp](https://github.com/yt-dlp/yt-dlp)                                                   |
| Audio Processing       | [MoviePy 1.0.3](https://zulko.github.io/moviepy/)                                             |
| Transcription          | [Whisper](https://github.com/openai/whisper)                                                  |
| Summarization          | [facebook/bart-large-cnn](https://huggingface.co/facebook/bart-large-cnn)                     |
| Post Generation        | [Ollama](https://ollama.com/) + Mistral                                                       |
| Workflow Orchestration | [Apache Airflow](https://airflow.apache.org/)                                                 |
| Containerization       | [Docker](https://www.docker.com/)                                                             |
| Task Scheduler         | [Airflow DAGs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html) |

---

##  How It Works

1. You paste a YouTube video URL into the UI.
2. The backend:

   * Downloads the video (yt\_dlp)
   * Extracts audio (MoviePy)
   * Transcribes using Whisper
   * Summarizes the transcript using BART
   * Generates captions for Twitter, Instagram, and YouTube Shorts using Ollama
3. The UI shows the transcript, summary, and social captions — with copy buttons!

---

## 📁 Project Structure

```
project-root/
├── app/
│   ├── api/                # FastAPI routes
│   ├── services/           # Core logic (transcriber, summarizer, generator)
│   ├── models/             # Pydantic schemas
│   ├── frontend/
│   │   ├── templates/      # Jinja2 HTML
│   │   └── static/         # JS, CSS
│   └── main.py             # FastAPI entry point
├── dags/                  # Airflow DAGs
├── docker/
│   ├── Dockerfile.api      # API container
│   └── Dockerfile.airflow  # Airflow container (if split)
├── docker-compose.yml
├── .env
├── .gitignore
└── README.md
```

---

## 🔧 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/yt-content-automation.git
cd yt-content-automation
```

### 2. Set up Environment

Create `.env` with:

```
OPENAI_API_KEY=your-key-if-used
WHISPER_DEVICE=cpu
```

Install requirements:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Start Services with Docker

```bash
docker-compose up --build
```

This launches:

* FastAPI on `http://localhost:8000/ui`
* Airflow UI on `http://localhost:8080` (user: `admin` / pass: `admin`)
* Ollama (Mistral model)

### 4. Access the App

*  FastAPI: [http://localhost:8000/ui](http://localhost:8000/ui)
*  Airflow UI: [http://localhost:8080](http://localhost:8080)
*  Ollama: [http://localhost:11434](http://localhost:11434)

---

##  Testing

Use the `/ui` frontend to input YouTube URLs and trigger the pipeline manually. Or use the Airflow UI to run DAGs.

---

##  Customization

* Swap Whisper with a faster model (like `faster-whisper`)
* Replace `facebook/bart-large-cnn` with another summarizer
* Replace `mistral` with `llama2`, `gemma`, etc., in Ollama
* Add support for auto-posting to Twitter/Instagram via APIs

---

##  Known Issues

* Large videos take longer to process
* Ollama must be fully initialized before requests (use health check/retries)
* Airflow + Docker + GPU support requires manual configuration

---