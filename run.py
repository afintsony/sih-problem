#!/usr/bin/env python3
"""
CogniNER - AI Cognitive Companion for Elderly Dementia Patients (NER Context)
Smart India Hackathon 2026 | Problem Statement ID: 26003 | MDoNER
Team: Bug BusterZz

Single-command launcher for the full-stack MVP.
"""

import sys
import os
import webbrowser
import threading
import time

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
sys.path.insert(0, BACKEND_DIR)

def print_banner():
    print("=" * 72)
    print("  🧠 CogniNER - AI Cognitive Companion for Elderly Dementia Patients")
    print("  Smart India Hackathon 2026 | Problem Statement ID: 26003 (MDoNER)")
    print("  Team: Bug BusterZz | Theme: MedTech / BioTech / HealthTech")
    print("=" * 72)
    print("  ✨ Key Features:")
    print("     • Offline-First Architecture (Local SQLite DB + Web Cache)")
    print("     • Multilingual Voice UI: English, অসমীয়া (Assamese), বাংলা, हिन्दी")
    print("     • 4 NER-Themed Cognitive Games (Kaziranga, Routine, Faces, Dhol)")
    print("     • AI Dynamic Difficulty Scoring Engine (Speed, Accuracy, Consistency)")
    print("     • 'Memory of Me' Digital Twin & Caregiver Clinical Dashboard")
    print("=" * 72)
    print("  🚀 Starting server on http://localhost:8000 ...")
    print("     - Elderly App & Caregiver Portal: http://localhost:8000")
    print("     - Interactive API Docs (Swagger):  http://localhost:8000/docs")
    print("=" * 72)

def open_browser():
    time.sleep(1.2)
    try:
        webbrowser.open("http://localhost:8000")
    except Exception as e:
        pass

def main():
    print_banner()

    # Import backend modules
    from database import init_db
    init_db()

    import uvicorn
    from main import app

    # Automatically open the browser in a background thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Run uvicorn server
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, app_dir=BACKEND_DIR)

if __name__ == "__main__":
    main()
