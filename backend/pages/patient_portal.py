import streamlit as st
import pandas as pd
import plotly.graph_objects as go

from data.mock_data import PATIENTS, VITALS, AI_MEAL_PLAN, NUTRITION_MACROS, VITALS_HISTORY
from utils.styles import inject_css, SAGE, TEAL, AMBER, CRIMSON
from utils.openai_client import chat

# ---------------------------------------------------------------------------
# System prompt for Dr. NutriCare
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are Dr. NutriCare, an advanced AI clinical nutritionist with 20+ years of specialisation in:
  • Maternal & prenatal nutrition (all trimesters, postpartum recovery)
  • Chronic illness dietary management (diabetes, hypertension, CKD, anaemia, thyroid disorders, PCOS, and more)

Your role is to:
1. Gather the patient's health profile (age, trimester/condition, allergies, dietary preferences, lab values if shared) through empathetic conversation.
2. Generate structured, evidence-based meal plans in the format:
      Breakfast | Mid-Morning Snack | Lunch | Evening Snack | Dinner
   with macro/micro nutrient highlights and portion sizes.
3. Flag any red-flag symptoms or nutrient deficiencies that require urgent medical review.
4. Always remind the patient that your advice is AI-generated and must be reviewed and approved by their treating physician before implementation.
5. Maintain a warm, supportive, and non-judgmental tone at all times.
6. Do NOT prescribe medications or replace clinical consultation.
When a patient asks for their final meal plan, generate it clearly and mention it is pending Doctor Approval before it can be actioned."""


# ---------------------------------------------------------------------------
# Main render function
# ---------------------------------------------------------------------------
def render():
    inject_css()

    # ── Session state initialisation ────────────────────────────────────────
    if "patient_messages" not in st.session_state:
        st.session_state.patient_messages = []
    if "patient_doctor_approved" not in st.session_state:
        st.session_state.patient_doctor_approved = False
    if "patient_plan_sent" not in st.session_state:
        st.session_state.patient_plan_sent = False

    patient = PATIENTS[0]

    # ── Page header ─────────────────────────────────────────────────────────
    st.markdown(
        f"""
        <div class="page-header">
            <h1>🤰 Patient Portal</h1>
            <p>Welcome, <strong>{patient['name']}</strong> · Week <strong>{patient['pregnancy_week']}</strong> of pregnancy</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    left_col, right_col = st.columns([2, 1], gap="large")

    # ════════════════════════════════════════════════════════════════════════
    # RIGHT COLUMN
    # ════════════════════════════════════════════════════════════════════════
    with right_col:

        # ── 4a · Doctor Approval panel ──────────────────────────────────────
        st.markdown("### ⚙️ Controls")

        doctor_approved = st.toggle(
            "Doctor Approval",
            value=st.session_state.patient_doctor_approved,
            help="Doctor must approve before sending final meal plan.",
        )
        st.session_state.patient_doctor_approved = doctor_approved

        if doctor_approved:
            st.markdown(
                """
                <div class="approval-granted">
                    <strong>Doctor Approval</strong><br>
                    ✔ Approved &middot; Meal plans cleared to send.
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                """
                <div class="approval-pending">
                    <strong>Doctor Approval</strong><br>
                    ✘ Pending &middot; Toggle ON to authorise.
                </div>
                """,
                unsafe_allow_html=True,
            )

        # ── 4b · Session info ───────────────────────────────────────────────
        msg_count = len(st.session_state.patient_messages)
        plan_status = "✅ Sent" if st.session_state.patient_plan_sent else "⏳ Not sent"
        st.caption(f"💬 Messages: {msg_count} &nbsp;|&nbsp; 📨 Plan: {plan_status}")

        st.markdown("---")

        # ── 4c · Vitals Overview ────────────────────────────────────────────
        st.markdown("### 📊 Vitals Overview")

        bg_value = VITALS["blood_glucose"]
        bg_color = TEAL if bg_value < 8 else AMBER
        bg_label = "Safe" if bg_value < 8 else "Attention"

        st.markdown(
            f"""
            <div style="background:#f8f9fa;border-radius:10px;padding:12px 16px;margin-bottom:10px;border-left:4px solid {bg_color};">
                <span style="font-size:0.78rem;color:#666;text-transform:uppercase;letter-spacing:.05em;">Blood Glucose</span><br>
                <span style="font-size:1.5rem;font-weight:700;color:#1a1a2e;">{bg_value}</span>
                <span style="font-size:0.85rem;color:#555;"> mmol/L</span>
                &nbsp;
                <span style="background:{bg_color};color:#fff;font-size:0.72rem;font-weight:600;
                             padding:2px 8px;border-radius:20px;">{bg_label}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        bp_sys = VITALS["blood_pressure_sys"]
        bp_dia = VITALS["blood_pressure_dia"]
        st.markdown(
            f"""
            <div style="background:#f8f9fa;border-radius:10px;padding:12px 16px;margin-bottom:10px;border-left:4px solid {SAGE};">
                <span style="font-size:0.78rem;color:#666;text-transform:uppercase;letter-spacing:.05em;">Blood Pressure</span><br>
                <span style="font-size:1.4rem;font-weight:700;color:#1a1a2e;">{bp_sys}/{bp_dia}</span>
                <span style="font-size:0.85rem;color:#555;"> mmHg</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        weight = VITALS["weight"]
        weight_change = VITALS["weight_change"]
        st.markdown(
            f"""
            <div style="background:#f8f9fa;border-radius:10px;padding:12px 16px;margin-bottom:14px;border-left:4px solid {AMBER};">
                <span style="font-size:0.78rem;color:#666;text-transform:uppercase;letter-spacing:.05em;">Weight</span><br>
                <span style="font-size:1.4rem;font-weight:700;color:#1a1a2e;">{weight} kg</span>
                <span style="font-size:0.85rem;color:#888;"> ↑ {weight_change} this week</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        week = patient["pregnancy_week"]
        st.markdown(
            f"<span style='font-size:0.82rem;color:#555;font-weight:600;'>🤰 Pregnancy Progress — Week {week} / 40</span>",
            unsafe_allow_html=True,
        )
        st.progress(week / 40)
        st.caption(f"{round((week / 40) * 100, 1)}% of full term")

        st.markdown("---")

        # ── 4d · Nutrition Donut ────────────────────────────────────────────
        labels = ["Carbohydrates", "Protein", "Fats", "Fiber"]
        values = [
            NUTRITION_MACROS["carbs"],
            NUTRITION_MACROS["protein"],
            NUTRITION_MACROS["fats"],
            NUTRITION_MACROS["fiber"],
        ]
        colors = ["#20B2AA", "#6B8E6F", "#F59E0B", "#DC2626"]

        fig = go.Figure(
            data=[
                go.Pie(
                    labels=labels,
                    values=values,
                    hole=0.55,
                    marker=dict(colors=colors),
                    textinfo="label+percent",
                    hovertemplate="%{label}: %{value}g<extra></extra>",
                )
            ]
        )
        fig.update_layout(
            title=dict(text="Daily Nutrition Profile", x=0.5, font=dict(size=14)),
            showlegend=True,
            legend=dict(orientation="h", yanchor="bottom", y=-0.25, xanchor="center", x=0.5),
            margin=dict(t=50, b=10, l=10, r=10),
            height=320,
        )
        st.plotly_chart(fig, use_container_width=True)

        st.markdown("---")

        # ── 4e · Clear chat button ──────────────────────────────────────────
        if st.button("🗑️ Clear Chat", use_container_width=True):
            st.session_state.patient_messages = []
            st.session_state.patient_plan_sent = False
            st.rerun()

    # ════════════════════════════════════════════════════════════════════════
    # LEFT COLUMN
    # ════════════════════════════════════════════════════════════════════════
    with left_col:

        # ── 4f · AI Meal Plan ───────────────────────────────────────────────
        st.markdown("#### 🍽️ Today's Meal Plan")

        for meal in AI_MEAL_PLAN["meals"]:
            st.markdown(
                f"""
                <div class="stat-row" style="display:flex;justify-content:space-between;align-items:center;
                            padding:10px 14px;background:#f8f9fa;border-radius:8px;margin-bottom:6px;">
                    <div>
                        <span style="font-size:0.75rem;color:#888;">{meal['time']}</span><br>
                        <span style="font-weight:600;color:#1a1a2e;">{meal['name']}</span>
                    </div>
                    <span style="background:{TEAL};color:#fff;font-size:0.75rem;font-weight:600;
                                 padding:3px 10px;border-radius:20px;">{meal['calories']} kcal</span>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown(
            f"""
            <div style="text-align:right;padding:6px 14px;font-size:0.9rem;color:#555;font-weight:600;">
                Total: <strong style="color:#1a1a2e;">{AI_MEAL_PLAN['total_calories']} kcal</strong>
            </div>
            """,
            unsafe_allow_html=True,
        )

        if st.button("⚡ Generate New Plan"):
            with st.spinner("Generating personalised meal plan…"):
                import time
                time.sleep(2)
            st.success("New plan generated!")

        st.markdown("<hr class='mn-divider'>", unsafe_allow_html=True)

        # ── 4g · Chat section ───────────────────────────────────────────────
        st.markdown("### 💬 Chat with Dr. NutriCare")

        messages = st.session_state.patient_messages

        if not messages:
            st.info(
                "👋 Hello! I'm **Dr. NutriCare**, your AI clinical nutritionist. "
                "Tell me about your dietary preferences, any symptoms, or ask me to create a personalised meal plan for you."
            )

        # Render chat history
        for msg in messages:
            role = msg["role"]
            content = msg["content"]

            if role == "user":
                st.markdown(
                    f"""
                    <div class="chat-user" style="display:flex;justify-content:flex-end;margin:6px 0;">
                        <div style="background:{TEAL};color:#fff;padding:10px 14px;border-radius:16px 16px 4px 16px;
                                    max-width:75%;font-size:0.9rem;line-height:1.5;">
                            {content}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            elif role == "assistant":
                st.markdown(
                    f"""
                    <div class="chat-bot" style="display:flex;justify-content:flex-start;margin:6px 0;">
                        <div style="background:#f0f4f0;color:#1a1a2e;padding:10px 14px;border-radius:16px 16px 16px 4px;
                                    max-width:75%;font-size:0.9rem;line-height:1.5;border-left:3px solid {SAGE};">
                            {content}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
            elif role == "system":
                st.markdown(
                    f"""
                    <div class="chat-sys" style="display:flex;justify-content:center;margin:6px 0;">
                        <div style="background:#fff8e1;color:#7a6000;padding:8px 14px;border-radius:20px;
                                    font-size:0.8rem;font-style:italic;max-width:80%;text-align:center;">
                            {content}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        # Chat input
        user_input = st.chat_input("Ask Dr. NutriCare…")

        if user_input:
            st.session_state.patient_messages.append({"role": "user", "content": user_input})

            try:
                with st.spinner("Dr. NutriCare is thinking…"):
                    reply = chat(SYSTEM_PROMPT, st.session_state.patient_messages)
            except Exception as e:
                st.error(f"⚠️ Could not reach Dr. NutriCare: {e}")
                reply = None

            if reply:
                st.session_state.patient_messages.append({"role": "assistant", "content": reply})

            st.rerun()

        # ── 4h · Send Meal Plan button ──────────────────────────────────────
        if st.session_state.patient_messages:
            approved = st.session_state.patient_doctor_approved

            send_clicked = st.button(
                "📨 Send Final Meal Plan",
                disabled=not approved,
                type="primary",
                use_container_width=True,
            )

            if not approved:
                st.warning("🔒 Enable Doctor Approval in the controls panel.")

            if send_clicked and approved:
                st.session_state.patient_plan_sent = True
                st.success("✅ Meal plan sent!")
                st.balloons()
