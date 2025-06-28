from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router


app = FastAPI(title="YouTube Transcriber")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mounting static directory for CSS/JS/assets (if added in future)
app.mount("/static", StaticFiles(directory="app/frontend/static"), name="static")

# This is the Jinja2 template directory for rendering HTML
templates = Jinja2Templates(directory="app/frontend/templates")

# Including the main API router
app.include_router(router)

#This is the UI Route to serve the frontend (from /ui)
@app.get("/ui", response_class=HTMLResponse)
async def read_ui(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})