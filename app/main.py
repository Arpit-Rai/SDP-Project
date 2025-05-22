from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.api.routes import router


app = FastAPI(title="YouTube Transcriber")

# Mount static directory for CSS/JS/assets (if added in future)
app.mount("/static", StaticFiles(directory="app/frontend/static"), name="static")

# Jinja2 template directory for rendering HTML
templates = Jinja2Templates(directory="app/frontend/templates")

# Include the main API router
app.include_router(router)

# UI Route to serve the frontend (from /ui)
@app.get("/ui", response_class=HTMLResponse)
async def read_ui(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})