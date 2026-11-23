import sys
import os
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from scoring_engine import CognitiveScoringEngine

class TestCognitiveScoringEngine(unittest.TestCase):

    def test_reaction_speed_score(self):
        # Fast response (1500ms or lower) should give 100
        self.assertEqual(CognitiveScoringEngine.calculate_reaction_speed_score(1200), 100.0)
        self.assertEqual(CognitiveScoringEngine.calculate_reaction_speed_score(1500), 100.0)
        
        # Slow response (6000ms or higher) should give 30
        self.assertEqual(CognitiveScoringEngine.calculate_reaction_speed_score(6500), 30.0)

        # Mid response (3750ms) should be roughly 65
        mid = CognitiveScoringEngine.calculate_reaction_speed_score(3750)
        self.assertTrue(60 <= mid <= 70)

    def test_composite_score(self):
        # High accuracy & fast speed
        result = CognitiveScoringEngine.compute_session_score(
            accuracy=90.0,
            reaction_time_ms=1800,
            errors_count=1,
            duration_seconds=45.0,
            total_items=6
        )
        self.assertIn("score", result)
        self.assertGreaterEqual(result["score"], 80.0)
        self.assertEqual(result["accuracy"], 90.0)

    def test_adaptive_difficulty_promotion(self):
        sessions = [
            {"score": 88.0, "accuracy": 90.0, "reaction_time_ms": 2000},
            {"score": 92.0, "accuracy": 95.0, "reaction_time_ms": 1900},
            {"score": 89.0, "accuracy": 90.0, "reaction_time_ms": 2100},
        ]
        eval_res = CognitiveScoringEngine.evaluate_adaptive_difficulty(
            current_difficulty="Easy",
            recent_sessions=sessions,
            auto_adapt=True
        )
        self.assertEqual(eval_res["recommended_difficulty"], "Medium")
        self.assertEqual(eval_res["action"], "promote")

    def test_adaptive_difficulty_demotion(self):
        sessions = [
            {"score": 45.0, "accuracy": 40.0, "reaction_time_ms": 5000},
            {"score": 48.0, "accuracy": 45.0, "reaction_time_ms": 5200},
        ]
        eval_res = CognitiveScoringEngine.evaluate_adaptive_difficulty(
            current_difficulty="Medium",
            recent_sessions=sessions,
            auto_adapt=True
        )
        self.assertEqual(eval_res["recommended_difficulty"], "Easy")
        self.assertEqual(eval_res["action"], "demote")

    def test_manual_lock(self):
        sessions = [
            {"score": 95.0, "accuracy": 100.0, "reaction_time_ms": 1600},
        ]
        eval_res = CognitiveScoringEngine.evaluate_adaptive_difficulty(
            current_difficulty="Easy",
            recent_sessions=sessions,
            auto_adapt=False
        )
        self.assertEqual(eval_res["recommended_difficulty"], "Easy")
        self.assertEqual(eval_res["action"], "manual_lock")

if __name__ == "__main__":
    unittest.main()
