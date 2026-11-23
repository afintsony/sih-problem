import sqlite3
import os
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "dementia_care.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Patient profile
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patient_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            stage TEXT NOT NULL,
            caregiver_name TEXT NOT NULL,
            caregiver_phone TEXT NOT NULL,
            preferred_language TEXT NOT NULL DEFAULT 'en',
            current_difficulty TEXT NOT NULL DEFAULT 'Medium',
            auto_adapt_difficulty INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Game session records
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS game_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            game_type TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            score REAL NOT NULL,
            accuracy REAL NOT NULL,
            reaction_time_ms REAL NOT NULL,
            consistency_score REAL NOT NULL,
            engagement_score REAL NOT NULL,
            errors_count INTEGER NOT NULL,
            duration_seconds REAL NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            synced INTEGER DEFAULT 1
        )
    ''')

    # Daily routines and medication schedules
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_routines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_as TEXT,
            title_bn TEXT,
            title_hi TEXT,
            time_str TEXT NOT NULL,
            category TEXT NOT NULL, -- 'medication', 'meal', 'exercise', 'hydration', 'social'
            dosage TEXT,
            status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'missed'
            date_str TEXT NOT NULL,
            completed_at TIMESTAMP
        )
    ''')

    # "Memory of Me" Digital Twin - Faces, Places, Landmarks
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS family_memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            relation TEXT NOT NULL,
            relation_as TEXT,
            relation_bn TEXT,
            relation_hi TEXT,
            hometown TEXT,
            story_prompt TEXT NOT NULL,
            story_prompt_as TEXT,
            avatar_color TEXT DEFAULT '#4A90E2',
            avatar_icon TEXT DEFAULT 'person',
            photo_url TEXT,
            hints_json TEXT
        )
    ''')

    # Caregiver Alerts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS caregiver_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_type TEXT NOT NULL,
            severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
            message TEXT NOT NULL,
            message_as TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            acknowledged INTEGER DEFAULT 0
        )
    ''')

    conn.commit()

    # Seed data if patient profile doesn't exist
    cursor.execute("SELECT COUNT(*) FROM patient_profile")
    if cursor.fetchone()[0] == 0:
        seed_data(cursor, conn)

    conn.close()

def seed_data(cursor, conn):
    # Default Patient: Bhaben Sarma, 73, Jorhat / Guwahati
    cursor.execute('''
        INSERT INTO patient_profile (
            name, age, stage, caregiver_name, caregiver_phone, preferred_language, current_difficulty, auto_adapt_difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        "Bhaben Sarma",
        73,
        "Mild Cognitive Impairment (Early Stage)",
        "Pranab Sarma (Son)",
        "+91 98640 12345",
        "en",
        "Medium",
        1
    ))

    # Seed Daily Routines for Today
    today_str = datetime.now().strftime("%Y-%m-%d")
    routines = [
        (
            "Morning BP Medicine (Amlodipine 5mg)",
            "ৰাতিপুৱাৰ প্ৰেচাৰৰ ঔষধ (এমল'ডিপিন ৫ মি.গ্ৰা.)",
            "সকালের প্রেসারের ওষুধ (অ্যামলোডিপিন ৫ মি.গ্রা.)",
            "सुबह की बीपी दवा (एम्लोडिपाइन 5 मि.ग्रा.)",
            "08:00 AM",
            "medication",
            "1 tablet with warm water",
            "completed",
            today_str,
            f"{today_str} 08:12:00"
        ),
        (
            "Traditional Assam Chai & Roti",
            "ৰাতিপুৱাৰ লাল চাহ আৰু ৰুটি",
            "সকালের লাল চা ও রুটি",
            "सुबह की असम चाय और रोटी",
            "08:30 AM",
            "meal",
            "Healthy breakfast",
            "completed",
            today_str,
            f"{today_str} 08:35:00"
        ),
        (
            "NER Cultural Memory Brain Game",
            "মগজুৰ খেল (কাজিৰঙা আৰু বিহু স্মৃতি)",
            "স্মৃতি পরীক্ষা ও মস্তিষ্কের খেলা",
            "मस्तिष्क स्मृति खेल (काजीरंगा और बिहू)",
            "10:30 AM",
            "exercise",
            "Play 2 rounds of matching",
            "pending",
            today_str,
            None
        ),
        (
            "Mid-day Hydration (Glass of Lemon Water)",
            "এগিলাচ নেমু পানী খাওক",
            "এক গ্লাস লেবু জল খান",
            "एक गिलास नींबू पानी पिएं",
            "01:00 PM",
            "hydration",
            "Drink 250ml water",
            "pending",
            today_str,
            None
        ),
        (
            "Afternoon Memory Routine Recall",
            "দৈনন্দিন কামৰ ক্ৰম মনত পেলোৱা",
            "দৈনন্দিন কাজের ক্রম মনে করা",
            "दैनिक दिनचर्या अनुक्रम अभ्यास",
            "04:00 PM",
            "exercise",
            "Timeline sequence exercise",
            "pending",
            today_str,
            None
        ),
        (
            "Evening Walk in Garden",
            "সন্ধিয়া ফুলনিত খোজ কঢ়া",
            "সন্ধ্যায় বাগানে হাঁটা",
            "शाम को बगीचे में टहलना",
            "05:30 PM",
            "exercise",
            "15 minutes gentle walk",
            "pending",
            today_str,
            None
        ),
        (
            "Night Dementia Care Medicine (Donepezil 5mg)",
            "ৰাতিৰ স্মৃতি শক্তিৰ ঔষধ (ডনেপেজিল ৫ মি.গ্ৰা.)",
            "রাতের স্মৃতিশক্তির ওষুধ (ডনেপেজিল ৫ মি.গ্রা.)",
            "रात की याददाश्त की दवा (डोनापेज़िल 5 मि.ग्रा.)",
            "09:00 PM",
            "medication",
            "1 tablet after dinner",
            "pending",
            today_str,
            None
        )
    ]

    for r in routines:
        cursor.execute('''
            INSERT INTO daily_routines (
                title, title_as, title_bn, title_hi, time_str, category, dosage, status, date_str, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', r)

    # Seed "Memory of Me" - Family & NER Hometown memories
    memories = [
        (
            "Ananya Sarma",
            "Granddaughter",
            "নাতিনী",
            "নাতনি",
            "पोती",
            "Guwahati",
            "Ananya is your 19-year-old granddaughter studying in Cotton University. She loves listening to your Bihu flute tunes.",
            "অনন্যা আপোনাৰ ১৯ বছৰীয়া নাতিনী, কটন বিশ্ববিদ্যালয়ত পঢ়ে। আপোনাৰ পেঁপা আৰু বাঁহীৰ সুৰ শুনি বৰ ভাল পায়।",
            "#E67E22",
            "face-woman",
            None,
            json.dumps(["Wears spectacles", "Calls every Sunday", "Loves pithas"])
        ),
        (
            "Pranab Sarma",
            "Son & Caregiver",
            "পুত্ৰ আৰু যত্ন লোৱা ব্যক্তি",
            "ছেলে",
            "बेटा",
            "Jorhat",
            "Pranab is your elder son. He manages tea research and helps you with your morning exercises and tea.",
            "প্ৰণৱ আপোনাৰ বৰ ল'ৰা। তেওঁ চাহ বাগিচা গৱেষণাত কাম কৰে আৰু আপোনাৰ সদায় যত্ন লয়।",
            "#27AE60",
            "face-man",
            None,
            json.dumps(["Works at Tocklai Jorhat", "Brings fresh organic tea", "Drives blue car"])
        ),
        (
            "Majuli Island Ancestral Home",
            "Ancestral Village",
            "পুৰণি পূৰ্বপুৰুষৰ ভেটি",
            "পৈতৃক ভিটা",
            "पैतृक गांव",
            "Majuli",
            "Your childhood home near the Kamalabari Satra. You grew up watching Bhaona theater and traditional Mukha (masks).",
            "কমলাবাৰী সত্ৰৰ ওচৰৰ আপোনাৰ ল’ৰালি কালৰ গাঁও। ভাওনা আৰু মুখা শিল্প আপোনাৰ অতি প্ৰিয়।",
            "#8E44AD",
            "home",
            None,
            json.dumps(["Brahmaputra river island", "Satra culture", "Handmade masks"])
        ),
        (
            "Brahmaputra Sunset Ghat",
            "Favorite Walk Spot",
            "সন্ধিয়া খোজ কঢ়া নদীৰ ঘাট",
            "নদীর ঘাট",
            "ब्रह्मपुत्र नदी घाट",
            "Guwahati Ghat",
            "The serene river bank where you walked with your spouse every Sunday evening enjoying roasted peanuts.",
            "ব্ৰহ্মপুত্ৰৰ পাৰৰ ঘাট য'ত আপুনি প্ৰতি দেওবাৰে সন্ধিয়া ফুৰিবলৈ গৈছিল।",
            "#2980B9",
            "water",
            None,
            json.dumps(["Sunset view", "Ferry boats", "Fresh river breeze"])
        )
    ]

    for m in memories:
        cursor.execute('''
            INSERT INTO family_memories (
                name, relation, relation_as, relation_bn, relation_hi,
                hometown, story_prompt, story_prompt_as, avatar_color, avatar_icon, photo_url, hints_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', m)

    # Seed 7 days of historical cognitive game sessions to provide real charts in the Caregiver Dashboard
    base_time = datetime.now() - timedelta(days=6)
    history = [
        ("sess_01", "ner_cultural_match", "Easy", 72.5, 75.0, 3200, 70.0, 80.0, 2, 95.0, 0),
        ("sess_02", "routine_sequencer", "Easy", 68.0, 70.0, 3500, 65.0, 75.0, 3, 110.0, 0),
        ("sess_03", "ner_cultural_match", "Easy", 84.0, 85.0, 2900, 80.0, 85.0, 1, 88.0, 1),
        ("sess_04", "face_place_recall", "Easy", 88.5, 90.0, 2700, 85.0, 90.0, 1, 80.0, 2),
        ("sess_05", "ner_cultural_match", "Medium", 78.0, 80.0, 2800, 75.0, 85.0, 2, 105.0, 3),
        ("sess_06", "speed_attention_drill", "Medium", 82.0, 85.0, 2400, 80.0, 88.0, 1, 75.0, 4),
        ("sess_07", "routine_sequencer", "Medium", 86.5, 90.0, 2300, 85.0, 92.0, 1, 70.0, 5),
        ("sess_08", "ner_cultural_match", "Medium", 89.0, 92.0, 2100, 88.0, 94.0, 0, 65.0, 6),
    ]

    for sid, gtype, diff, sc, acc, rt, cons, eng, err, dur, day_offset in history:
        t_stamp = (base_time + timedelta(days=day_offset, hours=10)).strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute('''
            INSERT INTO game_sessions (
                session_id, game_type, difficulty, score, accuracy, reaction_time_ms,
                consistency_score, engagement_score, errors_count, duration_seconds, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (sid, gtype, diff, sc, acc, rt, cons, eng, err, dur, t_stamp))

    # Seed Initial Caregiver Alerts
    alerts = [
        (
            "Routine Adherence",
            "info",
            "Morning medication (Amlodipine 5mg) successfully verified by patient Bhaben Sarma.",
            "ৰাতিপুৱাৰ ঔষধ সফলতাৰে খোৱা হ'ল বুলি নিশ্চিত কৰা হ'ল।",
            datetime.now().strftime("%Y-%m-%d 08:15:00")
        ),
        (
            "Cognitive Performance",
            "info",
            "Cognitive score improved +11% over the past 5 days following cultural memory drills.",
            "বিগত ৫ দিনত সাংস্কৃতিক স্মৃতি খেলৰ পিছত স্মৃতি শক্তি স্ক'ৰ +১১% বৃদ্ধি পাইছে।",
            (datetime.now() - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S")
        ),
        (
            "AI Difficulty Progression",
            "warning",
            "AI Engine upgraded game difficulty from Easy to Medium after 3 consecutive high-accuracy rounds (avg 88%).",
            "উন্নত ফলাফলৰ বাবে AI প্ৰণালীয়ে খেলৰ জটিলতা মজলীয়া পৰ্যায়লৈ উন্নীত কৰিছে।",
            (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
        )
    ]

    for a in alerts:
        cursor.execute('''
            INSERT INTO caregiver_alerts (alert_type, severity, message, message_as, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', a)

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
