import sys
import os
import unittest

# Add backend directory to path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from main import app
from database import init_db

class TestCogniNERAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_get_patient(self):
        response = self.client.get("/api/patient")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Bhaben Sarma")
        self.assertIn("current_difficulty", data)
        self.assertIn("avg_cognitive_score", data)

    def test_get_routines(self):
        response = self.client.get("/api/routines")
        self.assertEqual(response.status_code, 200)
        routines = response.json()
        self.assertIsInstance(routines, list)
        self.assertGreater(len(routines), 0)

    def test_complete_routine(self):
        # Fetch first routine
        routines = self.client.get("/api/routines").json()
        r_id = routines[0]["id"]
        
        # Toggle complete
        res = self.client.post(f"/api/routines/{r_id}/complete")
        self.assertEqual(res.status_code, 200)
        self.assertIn("new_status", res.json())

    def test_get_memories(self):
        response = self.client.get("/api/memories")
        self.assertEqual(response.status_code, 200)
        memories = response.json()
        self.assertIsInstance(memories, list)
        self.assertGreaterEqual(len(memories), 2)
        # Verify digital twin fields
        names = [m["name"] for m in memories]
        self.assertIn("Ananya Sarma", names)

    def test_sync_sessions(self):
        payload = {
            "sessions": [
                {
                    "session_id": "test_sync_001",
                    "game_type": "ner_cultural_match",
                    "difficulty": "Medium",
                    "accuracy": 92.0,
                    "reaction_time_ms": 2100.0,
                    "errors_count": 1,
                    "duration_seconds": 40.0
                }
            ]
        }
        response = self.client.post("/api/sessions/sync", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("current_difficulty", data)

    def test_caregiver_analytics(self):
        response = self.client.get("/api/caregiver/analytics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("composite_score", data)
        self.assertIn("adherence_percentage", data)
        self.assertIn("trend_chart", data)
        self.assertIn("alerts", data)

    def test_caregiver_difficulty_override(self):
        payload = {
            "difficulty": "Hard",
            "auto_adapt": False
        }
        response = self.client.post("/api/caregiver/difficulty-override", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["difficulty"], "Hard")
        self.assertFalse(response.json()["auto_adapt"])

        # Reset back to Medium with Auto-Adapt
        self.client.post("/api/caregiver/difficulty-override", json={"difficulty": "Medium", "auto_adapt": True})

if __name__ == "__main__":
    unittest.main()
