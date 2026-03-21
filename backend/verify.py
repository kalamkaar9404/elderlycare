import sys
sys.path.insert(0, '.')

from data.mock_data import (
    PATIENTS, MEAL_ORDERS, ALERTS, PENDING_PLANS,
    VITALS, VITALS_HISTORY, AI_MEAL_PLAN, NUTRITION_MACROS, OVERVIEW_STATS
)
print("mock_data: OK")

from utils.styles import inject_css, SAGE, TEAL, AMBER, CRIMSON
print("styles: OK")
print(f"  SAGE={SAGE}  TEAL={TEAL}  AMBER={AMBER}  CRIMSON={CRIMSON}")

from utils.openai_client import get_client, chat
print("openai_client: OK")

# Test page imports (syntax only — can't run st. calls without a browser)
import py_compile, os
for page in ["pages/overview.py","pages/patient_portal.py","pages/kitchen_command.py","pages/doc_monitor.py","app.py"]:
    py_compile.compile(page, doraise=True)
    print(f"  syntax OK: {page}")

print()
print("=== DATA INTEGRITY ===")
print(f"  Patients         : {len(PATIENTS)}")
print(f"  Meal orders      : {len(MEAL_ORDERS)}")
print(f"  Alerts           : {len(ALERTS)}")
print(f"  Pending plans    : {len(PENDING_PLANS)}")
print(f"  Vitals history   : {len(VITALS_HISTORY)} rows")
print(f"  Overview stats   : {OVERVIEW_STATS}")
print(f"  Nutrition macros : {NUTRITION_MACROS}")
print(f"  AI Meal plan meals: {len(AI_MEAL_PLAN['meals'])}")

print()
print("=== CROSS-CHECKS (frontend parity) ===")

# Colour parity with frontend lib/medical-colors.ts
assert SAGE == "#6B8E6F",    f"SAGE mismatch: {SAGE}"
assert TEAL == "#20B2AA",    f"TEAL mismatch: {TEAL}"
assert AMBER == "#F59E0B",   f"AMBER mismatch: {AMBER}"
assert CRIMSON == "#DC2626", f"CRIMSON mismatch: {CRIMSON}"
print("  Colour parity with frontend: PASS")

# Patient IDs p1-p5
ids = {p["id"] for p in PATIENTS}
assert ids == {"p1","p2","p3","p4","p5"}, f"Patient IDs wrong: {ids}"
print("  Patient IDs p1-p5: PASS")

# MEAL_ORDERS reference patient IDs that exist
order_pids = {o["patient_id"] for o in MEAL_ORDERS}
assert order_pids.issubset(ids), f"Order patient IDs invalid: {order_pids - ids}"
print("  Meal order patient refs: PASS")

# ALERTS reference patient IDs that exist
alert_pids = {a["patient_id"] for a in ALERTS}
assert alert_pids.issubset(ids), f"Alert patient IDs invalid: {alert_pids - ids}"
print("  Alert patient refs: PASS")

# Vitals history has day, glucose, systolic, diastolic
row = VITALS_HISTORY[0]
assert all(k in row for k in ["day","glucose","systolic","diastolic"]), f"Bad vitals row: {row}"
print("  Vitals history schema: PASS")

# AI meal plan meals match MEALS ids
meal_ids = {m["id"] for m in __import__('data.mock_data', fromlist=['MEALS']).MEALS}
for item in AI_MEAL_PLAN["meals"]:
    assert item["meal"]["id"] in meal_ids, f"AI plan references unknown meal: {item['meal']['id']}"
print("  AI meal plan meal refs: PASS")

print()
print("ALL CHECKS PASSED")
