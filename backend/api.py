from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import uuid

from database import get_db_connection
from scoring_engine import CognitiveScoringEngine

router = APIRouter(prefix="/api")

# --- Pydantic Schemas ---
class SessionSyncItem(BaseModel):
    session_id: Optional[str] = None
    game_type: str
    difficulty: str
    accuracy: float
    reaction_time_ms: float
    errors_count: int
    duration_seconds: float
    timestamp: Optional[str] = None

class BatchSessionSync(BaseModel):
    sessions: List[SessionSyncItem]

class DifficultyOverrideRequest(BaseModel):
    difficulty: str
    auto_adapt: bool

class RoutineCreateRequest(BaseModel):
    title: str
    title_as: Optional[str] = None
    title_bn: Optional[str] = None
    title_hi: Optional[str] = None
    time_str: str
    category: str
    dosage: Optional[str] = None

class MemoryCreateRequest(BaseModel):
    name: str
    relation: str
    relation_as: Optional[str] = None
    relation_bn: Optional[str] = None
    relation_hi: Optional[str] = None
    hometown: Optional[str] = None
    story_prompt: str
    story_prompt_as: Optional[str] = None
    avatar_color: Optional[str] = "#3498DB"
    avatar_icon: Optional[str] = "person"
    photo_url: Optional[str] = None
    hints: Optional[List[str]] = []

class PatientUpdateRequest(BaseModel):
    preferred_language: Optional[str] = None
    name: Optional[str] = None
    caregiver_name: Optional[str] = None
    caregiver_phone: Optional[str] = None

# --- Endpoints ---

DEMO_USERS = [
    {
        "id": "patient_1",
        "name": "Bhaben Sarma",
        "role": "patient",
        "role_label": "Elderly Patient (73 yrs)",
        "location": "Jorhat / Guwahati, Assam",
        "stage": "Mild Cognitive Impairment",
        "avatar": "👴",
        "preferred_language": "as"
    },
    {
        "id": "caregiver_1",
        "name": "Pranab Sarma",
        "role": "caregiver",
        "role_label": "Family Caregiver (Son)",
        "location": "Jorhat, Assam",
        "patient_name": "Bhaben Sarma",
        "avatar": "👨‍💼",
        "preferred_language": "en"
    },
    {
        "id": "doctor_1",
        "name": "Dr. Hemanta Barua",
        "role": "clinician",
        "role_label": "Geriatric Specialist / ASHA Coordinator",
        "location": "Guwahati Medical College & Hospital (GMCH)",
        "assigned_patients": ["Bhaben Sarma", "Minati Devi"],
        "avatar": "🩺",
        "preferred_language": "en"
    },
    {
        "id": "patient_2",
        "name": "Minati Devi",
        "role": "patient",
        "role_label": "Elderly Patient (68 yrs)",
        "location": "Tezpur, Assam",
        "stage": "Early Stage Dementia",
        "avatar": "👵",
        "preferred_language": "as"
    }
]

@router.get("/auth/demo-users")
def get_demo_users():
    """Returns pre-configured demo user personas for quick switching."""
    return {
        "status": "success",
        "users": DEMO_USERS,
        "active_user": DEMO_USERS[0]
    }

@router.get("/patient")
def get_patient():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patient_profile ORDER BY id ASC LIMIT 1")
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient profile not found")

    patient = dict(row)

    # Get aggregate score stats
    cursor.execute("SELECT AVG(score) as avg_score, COUNT(*) as total_sessions FROM game_sessions")
    stats = cursor.fetchone()
    patient["avg_cognitive_score"] = round(stats["avg_score"] or 75.0, 1)
    patient["total_sessions"] = stats["total_sessions"]

    conn.close()
    return patient

@router.put("/patient")
def update_patient(req: PatientUpdateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM patient_profile LIMIT 1")
    patient = cursor.fetchone()
    if not patient:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient profile not found")

    updates = []
    values = []
    if req.preferred_language is not None:
        updates.append("preferred_language = ?")
        values.append(req.preferred_language)
    if req.name is not None:
        updates.append("name = ?")
        values.append(req.name)
    if req.caregiver_name is not None:
        updates.append("caregiver_name = ?")
        values.append(req.caregiver_name)
    if req.caregiver_phone is not None:
        updates.append("caregiver_phone = ?")
        values.append(req.caregiver_phone)

    if updates:
        values.append(patient["id"])
        cursor.execute(f"UPDATE patient_profile SET {', '.join(updates)} WHERE id = ?", values)
        conn.commit()

    conn.close()
    return {"status": "success", "message": "Patient profile updated"}

@router.post("/sessions/sync")
def sync_sessions(payload: BatchSessionSync):
    """
    Offline-First Sync Endpoint:
    Receives games played offline, computes Cognitive Scores, stores them,
    and updates adaptive difficulty and alerts.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM patient_profile LIMIT 1")
    patient_row = cursor.fetchone()
    current_difficulty = patient_row["current_difficulty"] if patient_row else "Medium"
    auto_adapt = bool(patient_row["auto_adapt_difficulty"]) if patient_row else True

    processed_sessions = []
    for item in payload.sessions:
        session_id = item.session_id or f"sess_{uuid.uuid4().hex[:8]}"
        
        # Check if already synced
        cursor.execute("SELECT id FROM game_sessions WHERE session_id = ?", (session_id,))
        if cursor.fetchone():
            continue

        score_res = CognitiveScoringEngine.compute_session_score(
            accuracy=item.accuracy,
            reaction_time_ms=item.reaction_time_ms,
            errors_count=item.errors_count,
            duration_seconds=item.duration_seconds
        )

        timestamp = item.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute('''
            INSERT INTO game_sessions (
                session_id, game_type, difficulty, score, accuracy, reaction_time_ms,
                consistency_score, engagement_score, errors_count, duration_seconds, timestamp, synced
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ''', (
            session_id,
            item.game_type,
            item.difficulty,
            score_res["score"],
            score_res["accuracy"],
            score_res["reaction_time_ms"],
            score_res["consistency_score"],
            score_res["engagement_score"],
            item.errors_count,
            item.duration_seconds,
            timestamp
        ))
        processed_sessions.append(score_res)

    conn.commit()

    # Now evaluate dynamic difficulty
    cursor.execute('''
        SELECT score, accuracy, reaction_time_ms, difficulty, timestamp 
        FROM game_sessions 
        ORDER BY id DESC LIMIT 10
    ''')
    recent = [dict(r) for r in cursor.fetchall()]
    recent.reverse()

    adaptation_result = CognitiveScoringEngine.evaluate_adaptive_difficulty(
        current_difficulty=current_difficulty,
        recent_sessions=recent,
        auto_adapt=auto_adapt
    )

    new_diff = adaptation_result["recommended_difficulty"]
    if new_diff != current_difficulty and auto_adapt:
        cursor.execute("UPDATE patient_profile SET current_difficulty = ? WHERE id = ?", (new_diff, patient_row["id"]))
        conn.commit()

    # If an alert was generated, insert into caregiver alerts
    if adaptation_result.get("alert"):
        al = adaptation_result["alert"]
        cursor.execute('''
            INSERT INTO caregiver_alerts (alert_type, severity, message, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (al["alert_type"], al["severity"], al["message"], datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()

    conn.close()

    return {
        "status": "success",
        "synced_count": len(processed_sessions),
        "current_difficulty": new_diff,
        "adaptation": adaptation_result
    }

@router.get("/sessions")
def get_sessions(limit: int = 15):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM game_sessions ORDER BY id DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@router.get("/routines")
def get_routines():
    conn = get_db_connection()
    cursor = conn.cursor()
    today_str = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("SELECT * FROM daily_routines ORDER BY time_str ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@router.post("/routines/{routine_id}/complete")
def complete_routine(routine_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM daily_routines WHERE id = ?", (routine_id,))
    routine = cursor.fetchone()
    if not routine:
        conn.close()
        raise HTTPException(status_code=404, detail="Routine not found")

    new_status = "completed" if routine["status"] != "completed" else "pending"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S") if new_status == "completed" else None

    cursor.execute("UPDATE daily_routines SET status = ?, completed_at = ? WHERE id = ?", (new_status, now_str, routine_id))
    
    # If completed a medication, create an info alert for caregiver
    if new_status == "completed" and routine["category"] == "medication":
        cursor.execute('''
            INSERT INTO caregiver_alerts (alert_type, severity, message, timestamp)
            VALUES (?, ?, ?, ?)
        ''', ("Medication Taken", "info", f"Patient took '{routine['title']}' at {datetime.now().strftime('%I:%M %p')}.", now_str))

    conn.commit()
    conn.close()
    return {"status": "success", "new_status": new_status}

@router.post("/routines")
def create_routine(req: RoutineCreateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    today_str = datetime.now().strftime("%Y-%m-%d")
    cursor.execute('''
        INSERT INTO daily_routines (title, title_as, title_bn, title_hi, time_str, category, dosage, status, date_str)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    ''', (req.title, req.title_as, req.title_bn, req.title_hi, req.time_str, req.category, req.dosage, today_str))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Routine created"}

@router.get("/memories")
def get_memories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM family_memories ORDER BY id ASC")
    rows = []
    for r in cursor.fetchall():
        d = dict(r)
        if d.get("hints_json"):
            try:
                d["hints"] = json.loads(d["hints_json"])
            except:
                d["hints"] = []
        else:
            d["hints"] = []
        rows.append(d)
    conn.close()
    return rows

@router.post("/memories")
def create_memory(req: MemoryCreateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    hints_str = json.dumps(req.hints) if req.hints else "[]"
    cursor.execute('''
        INSERT INTO family_memories (
            name, relation, relation_as, relation_bn, relation_hi, hometown,
            story_prompt, story_prompt_as, avatar_color, avatar_icon, photo_url, hints_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        req.name, req.relation, req.relation_as, req.relation_bn, req.relation_hi,
        req.hometown, req.story_prompt, req.story_prompt_as, req.avatar_color,
        req.avatar_icon, req.photo_url, hints_str
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Memory added"}

@router.delete("/memories/{memory_id}")
def delete_memory(memory_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM family_memories WHERE id = ?", (memory_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Memory deleted"}

@router.get("/caregiver/analytics")
def get_caregiver_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Patient info
    cursor.execute("SELECT * FROM patient_profile LIMIT 1")
    patient = dict(cursor.fetchone())

    # All sessions ordered by timestamp
    cursor.execute("SELECT * FROM game_sessions ORDER BY timestamp ASC")
    sessions = [dict(r) for r in cursor.fetchall()]

    # Domain metrics breakdown
    avg_score = 0.0
    avg_accuracy = 0.0
    avg_speed = 0.0
    avg_consistency = 0.0
    avg_reaction_time = 0.0

    if sessions:
        avg_score = sum(s["score"] for s in sessions) / len(sessions)
        avg_accuracy = sum(s["accuracy"] for s in sessions) / len(sessions)
        avg_consistency = sum(s["consistency_score"] for s in sessions) / len(sessions)
        avg_reaction_time = sum(s["reaction_time_ms"] for s in sessions) / len(sessions)
        avg_speed = sum(CognitiveScoringEngine.calculate_reaction_speed_score(s["reaction_time_ms"]) for s in sessions) / len(sessions)

    # Routine adherence rate
    cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed FROM daily_routines")
    r_stats = cursor.fetchone()
    total_routines = r_stats["total"] or 1
    completed_routines = r_stats["completed"] or 0
    adherence_pct = round((completed_routines / total_routines) * 100, 1)

    # Trend data formatted for Chart.js
    trend_labels = []
    trend_scores = []
    trend_accuracy = []
    trend_speed = []

    for s in sessions[-10:]: # last 10 sessions
        dt_str = s["timestamp"]
        try:
            short_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").strftime("%b %d %H:%M")
        except:
            short_dt = dt_str
        trend_labels.append(short_dt)
        trend_scores.append(round(s["score"], 1))
        trend_accuracy.append(round(s["accuracy"], 1))
        trend_speed.append(round(CognitiveScoringEngine.calculate_reaction_speed_score(s["reaction_time_ms"]), 1))

    # Alerts
    cursor.execute("SELECT * FROM caregiver_alerts ORDER BY id DESC LIMIT 6")
    alerts = [dict(a) for a in cursor.fetchall()]

    conn.close()

    return {
        "patient": patient,
        "composite_score": round(avg_score, 1),
        "accuracy": round(avg_accuracy, 1),
        "reaction_speed_score": round(avg_speed, 1),
        "consistency": round(avg_consistency, 1),
        "avg_reaction_time_ms": round(avg_reaction_time, 0),
        "adherence_percentage": adherence_pct,
        "completed_routines": completed_routines,
        "total_routines": total_routines,
        "total_sessions": len(sessions),
        "trend_chart": {
            "labels": trend_labels,
            "scores": trend_scores,
            "accuracy": trend_accuracy,
            "speed": trend_speed
        },
        "alerts": alerts
    }

@router.post("/caregiver/difficulty-override")
def difficulty_override(req: DifficultyOverrideRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE patient_profile 
        SET current_difficulty = ?, auto_adapt_difficulty = ? 
        WHERE id = 1
    ''', (req.difficulty, 1 if req.auto_adapt else 0))
    
    # Insert caregiver alert
    mode_text = "Automatic AI Adaptation" if req.auto_adapt else "Manual Override Lock"
    cursor.execute('''
        INSERT INTO caregiver_alerts (alert_type, severity, message, timestamp)
        VALUES (?, ?, ?, ?)
    ''', ("Caregiver Control", "info", f"Caregiver set difficulty level to {req.difficulty} ({mode_text}).", datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    
    conn.commit()
    conn.close()
    return {"status": "success", "difficulty": req.difficulty, "auto_adapt": req.auto_adapt}
