"""
mock_data.py
────────────
Single source of truth for all mock data.
Mirrors frontend/lib/mock-data.ts exactly so both stacks stay in sync.
"""
from datetime import datetime, timedelta
import random

# ── Patients ────────────────────────────────────────────────────────────────
PATIENTS = [
    {"id": "p1", "name": "Jane Doe",        "age": 28, "pregnancy_week": 28, "risk_level": "low",    "status": "active"},
    {"id": "p2", "name": "Priya Sharma",    "age": 32, "pregnancy_week": 24, "risk_level": "medium", "status": "active"},
    {"id": "p3", "name": "Amara Okonkwo",   "age": 26, "pregnancy_week": 20, "risk_level": "high",   "status": "active"},
    {"id": "p4", "name": "Sarah Johnson",   "age": 30, "pregnancy_week": 32, "risk_level": "low",    "status": "pending"},
    {"id": "p5", "name": "Maria Garcia",    "age": 27, "pregnancy_week": 16, "risk_level": "low",    "status": "active"},
]

# ── Vitals ───────────────────────────────────────────────────────────────────
VITALS = {
    "blood_glucose":      7.2,
    "blood_pressure_sys": 130,
    "blood_pressure_dia": 85,
    "weight":             68.5,
    "weight_change":      1.2,
}

# ── 30-day vitals history ────────────────────────────────────────────────────
random.seed(42)
VITALS_HISTORY = [
    {
        "day":      i + 1,
        "glucose":  round(6.8 + random.random() * 2, 2),
        "systolic": round(120 + random.random() * 20, 1),
        "diastolic":round(75  + random.random() * 20, 1),
    }
    for i in range(30)
]

# ── Meals ────────────────────────────────────────────────────────────────────
MEALS = [
    {"id": "m1", "name": "Ragi Porridge with Jaggery",    "type": "breakfast", "calories": 280, "ingredients": ["Ragi flour", "Jaggery", "Ghee", "Cardamom"],                       "serving_size": "200"},
    {"id": "m2", "name": "Spinach and Lentil Dal",         "type": "lunch",     "calories": 350, "ingredients": ["Red lentils", "Spinach", "Turmeric", "Cumin"],                     "serving_size": "250"},
    {"id": "m3", "name": "Red Rice with Vegetables",       "type": "lunch",     "calories": 380, "ingredients": ["Red rice", "Carrots", "Beans", "Peas", "Coconut oil"],             "serving_size": "280"},
    {"id": "m4", "name": "Banana and Almond Smoothie",     "type": "snack",     "calories": 210, "ingredients": ["Banana", "Almonds", "Milk", "Honey"],                             "serving_size": "200"},
    {"id": "m5", "name": "Millet Upma with Vegetables",    "type": "dinner",    "calories": 320, "ingredients": ["Millet", "Carrot", "Peas", "Mustard seeds", "Onion"],             "serving_size": "250"},
]

# ── Meal Orders ───────────────────────────────────────────────────────────────
MEAL_ORDERS = [
    {"id": "o1", "patient_id": "p1", "patient_name": "Jane Doe",      "meal_type": "Ragi Porridge",  "due_time": "08:00 AM", "status": "pending",   "quantity": 1},
    {"id": "o2", "patient_id": "p1", "patient_name": "Jane Doe",      "meal_type": "Spinach Dal",    "due_time": "12:30 PM", "status": "preparing", "quantity": 1},
    {"id": "o3", "patient_id": "p2", "patient_name": "Priya Sharma",  "meal_type": "Red Rice Bowl",  "due_time": "12:30 PM", "status": "ready",     "quantity": 2},
    {"id": "o4", "patient_id": "p3", "patient_name": "Amara Okonkwo", "meal_type": "Millet Upma",    "due_time": "06:00 PM", "status": "pending",   "quantity": 1},
]

# ── Alerts ───────────────────────────────────────────────────────────────────
now = datetime.now()
ALERTS = [
    {"id": "a1", "patient_id": "p1", "type": "critical", "message": "Blood glucose spike detected: 9.1 mmol/L",    "timestamp": now,                        "resolved": False},
    {"id": "a2", "patient_id": "p3", "type": "warning",  "message": "Missing weight entry for today",              "timestamp": now - timedelta(hours=1),   "resolved": False},
    {"id": "a3", "patient_id": "p2", "type": "warning",  "message": "Blood pressure elevated: 145/92 mmHg",        "timestamp": now - timedelta(hours=2),   "resolved": True},
]

# ── AI Meal Plan ──────────────────────────────────────────────────────────────
AI_MEAL_PLAN = {
    "id":              "plan1",
    "patient_id":      "p1",
    "status":          "pending",
    "generated_at":    now,
    "approved_at":     None,
    "meals": [
        {"time": "8:00 AM",  "meal": MEALS[0], "calories": 280},
        {"time": "11:00 AM", "meal": MEALS[3], "calories": 210},
        {"time": "1:00 PM",  "meal": MEALS[1], "calories": 350},
        {"time": "4:00 PM",  "meal": MEALS[3], "calories": 210},
        {"time": "7:00 PM",  "meal": MEALS[4], "calories": 320},
    ],
    "total_calories":  1370,
    "nutrition_score": 8.5,
}

# ── Pending Approval Plans ────────────────────────────────────────────────────
PENDING_PLANS = [
    {"id": "ap1", "patient_name": "Jane Doe",      "meal_count": 5, "total_calories": 1370, "generated_at": now,                        "status": "pending"},
    {"id": "ap2", "patient_name": "Priya Sharma",  "meal_count": 4, "total_calories": 1150, "generated_at": now - timedelta(hours=2),   "status": "pending"},
    {"id": "ap3", "patient_name": "Amara Okonkwo", "meal_count": 6, "total_calories": 1520, "generated_at": now - timedelta(hours=4),   "status": "pending"},
]

# ── Nutrition macros ──────────────────────────────────────────────────────────
NUTRITION_MACROS = {"carbs": 280, "protein": 85, "fats": 65, "fiber": 35}

# ── Overview KPI stats ────────────────────────────────────────────────────────
OVERVIEW_STATS = {
    "total_patients":     len(PATIENTS),
    "active_orders":      len(MEAL_ORDERS),
    "pending_approvals":  len(PENDING_PLANS),
    "critical_alerts":    sum(1 for a in ALERTS if a["type"] == "critical" and not a["resolved"]),
}
