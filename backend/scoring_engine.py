from datetime import datetime, timedelta
from typing import Dict, Any, List

class CognitiveScoringEngine:
    """
    AI/ML Scoring & Dynamic Difficulty Adaptation Engine for Dementia Care (NER Context)
    Calculates composite Cognitive Performance Score and adjusts difficulty based on
    reaction time, accuracy, consistency, and session engagement.
    """

    @staticmethod
    def calculate_reaction_speed_score(reaction_time_ms: float) -> float:
        """
        Scales reaction speed for elderly demographics.
        Expected baseline: 1500ms = 100 pts, 6000ms+ = ~30 pts.
        """
        if reaction_time_ms <= 1500:
            return 100.0
        elif reaction_time_ms >= 6000:
            return 30.0
        else:
            # Linear scaling between 1500ms (100) and 6000ms (30)
            score = 100.0 - ((reaction_time_ms - 1500.0) / 4500.0) * 70.0
            return round(max(20.0, min(100.0, score)), 1)

    @staticmethod
    def calculate_consistency_score(errors_count: int, total_attempts: int) -> float:
        """
        Evaluates task execution consistency based on error dispersion.
        """
        if total_attempts <= 0:
            return 80.0
        error_ratio = errors_count / max(1, total_attempts)
        score = max(20.0, 100.0 - (error_ratio * 80.0))
        return round(score, 1)

    @classmethod
    def compute_session_score(
        cls,
        accuracy: float,
        reaction_time_ms: float,
        errors_count: int,
        duration_seconds: float,
        total_items: int = 6
    ) -> Dict[str, float]:
        """
        Computes weighted Cognitive Performance Score:
        Accuracy (40%) + Reaction Speed (30%) + Consistency (20%) + Engagement (10%)
        """
        acc_clamped = max(0.0, min(100.0, float(accuracy)))
        speed_score = cls.calculate_reaction_speed_score(reaction_time_ms)
        consistency_score = cls.calculate_consistency_score(errors_count, total_items)
        
        # Engagement: completed session within reasonable time frame
        engagement_score = 100.0 if duration_seconds >= 10.0 else max(50.0, duration_seconds * 5.0)

        composite_score = (
            (0.40 * acc_clamped) +
            (0.30 * speed_score) +
            (0.20 * consistency_score) +
            (0.10 * engagement_score)
        )

        return {
            "score": round(composite_score, 1),
            "accuracy": round(acc_clamped, 1),
            "reaction_speed_score": round(speed_score, 1),
            "reaction_time_ms": round(reaction_time_ms, 1),
            "consistency_score": round(consistency_score, 1),
            "engagement_score": round(engagement_score, 1)
        }

    @staticmethod
    def evaluate_adaptive_difficulty(
        current_difficulty: str,
        recent_sessions: List[Dict[str, Any]],
        auto_adapt: bool = True
    ) -> Dict[str, Any]:
        """
        Adaptive Algorithm:
        - If recent score average >= 85% and accuracy >= 85% -> Promote level (Easy -> Medium -> Hard)
        - If recent score average < 55% or accuracy < 50% -> Demote level (Hard -> Medium -> Easy)
        - Detects early warning trends (e.g. sharp decline > 15%)
        """
        difficulty_levels = ["Easy", "Medium", "Hard"]
        current_idx = difficulty_levels.index(current_difficulty) if current_difficulty in difficulty_levels else 1

        if not recent_sessions:
            return {
                "recommended_difficulty": current_difficulty,
                "action": "maintain",
                "trend": "stable",
                "alert": None
            }

        # Analyze last up to 4 sessions
        sample = recent_sessions[-4:]
        avg_score = sum(s["score"] for s in sample) / len(sample)
        avg_accuracy = sum(s["accuracy"] for s in sample) / len(sample)
        avg_reaction_time = sum(s["reaction_time_ms"] for s in sample) / len(sample)

        recommended_difficulty = current_difficulty
        action = "maintain"
        alert = None

        if avg_score >= 85.0 and avg_accuracy >= 85.0:
            if current_idx < len(difficulty_levels) - 1:
                recommended_difficulty = difficulty_levels[current_idx + 1]
                action = "promote"
                alert = {
                    "alert_type": "AI Adaptation",
                    "severity": "info",
                    "message": f"High performance detected ({avg_score:.1f}% avg). Difficulty automatically increased to {recommended_difficulty}."
                }
        elif avg_score < 55.0 or avg_accuracy < 50.0:
            if current_idx > 0:
                recommended_difficulty = difficulty_levels[current_idx - 1]
                action = "demote"
                alert = {
                    "alert_type": "AI Adaptation",
                    "severity": "warning",
                    "message": f"Assistance activated ({avg_score:.1f}% avg). Difficulty adjusted down to {recommended_difficulty} to support patient confidence."
                }

        # Check for sharp decline trend if we have >= 3 sessions
        trend = "stable"
        if len(recent_sessions) >= 3:
            first_half = recent_sessions[:len(recent_sessions)//2]
            second_half = recent_sessions[len(recent_sessions)//2:]
            first_avg = sum(s["score"] for s in first_half) / len(first_half)
            second_avg = sum(s["score"] for s in second_half) / len(second_half)

            diff = second_avg - first_avg
            if diff >= 5.0:
                trend = "improving"
            elif diff <= -12.0:
                trend = "declining"
                if not alert:
                    alert = {
                        "alert_type": "Cognitive Decline Alert",
                        "severity": "warning",
                        "message": f"A recent drop of {abs(diff):.1f}% in cognitive score was noted. Caregiver check-in recommended."
                    }

        return {
            "recommended_difficulty": recommended_difficulty if auto_adapt else current_difficulty,
            "action": action if auto_adapt else "manual_lock",
            "trend": trend,
            "avg_score": round(avg_score, 1),
            "avg_accuracy": round(avg_accuracy, 1),
            "avg_reaction_time_ms": round(avg_reaction_time, 1),
            "alert": alert
        }
