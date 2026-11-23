from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import init_db
from api import router as api_router

# Initialize database
init_db()

app = FastAPI(
    title="CogniNER - AI Cognitive Companion for Dementia Care",
    description="Smart India Hackathon 2026 (PS 26003) - AI-Based Cognitive Gaming & Memory Assistance for NER Elderly",
    version="1.0.0"
)

# Enable CORS for local cross-origin development if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

from fastapi.responses import Response

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧠</text></svg>'''
    return Response(content=svg, media_type="image/svg+xml")

# Mount Frontend static files
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
