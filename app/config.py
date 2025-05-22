import os
from dotenv import load_dotenv

load_dotenv()  # Load at app startup

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")