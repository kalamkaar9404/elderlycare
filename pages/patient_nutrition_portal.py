"""
Patient Nutrition Portal
────────────────────────
AI Clinical Nutritionist for pregnant women & chronic-illness patients.
Includes a Doctor Approval toggle that must be enabled before the final
meal plan can be sent / confirmed.
"""

import os
import streamlit as st
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ── System prompt ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are Dr. NutriCare, an advanced AI clinical nutritionist with 20+ years of 
specialisation in:
  • Maternal & prenatal nutrition (all trimesters, postpartum recovery)
  • Chronic illness dietary management (diabetes, hypertension, CKD, anaemia,
    thyroid disorders, PCOS, and more)

Your role is to:
1. Gather the patient's health profile (age, trimester/condition, allergies,
   dietary preferences, lab values if shared) through empathetic conversation.
2. Generate structured, evidence-based meal plans in the format:
      Breakfast | Mid-Morning Snack | Lunch | Evening Snack | Dinner
   with macro/micro nutrient highlights and portion sizes.
3. Flag any red-flag symptoms or nutrient deficiencies that require urgent
   medical review.
4. Always remind the patient that your advice is AI-generated and must be
   reviewed and approved by their treating physician before implementation.
5. Maintain a warm, supportive, and non-judgmental tone at all times.
6. Do NOT prescribe medications or replace clinical consultation.

When a patient asks for their final meal plan, generate it clearly and mention
that it is pending Doctor Approval before it can be actioned.
""".strip()


def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        st.error(
            "⚠️ **OPENAI_API_KEY** not found. Please add it to your `.env` file and restart."
        )
        st.stop()
    
    # ADD base_url here to route through OpenRouter
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key
    )


def render():
    # ── Page styling ─────────────────────────────────────────────────────────
    st.markdown(
        """
        <style>
            .portal-header {
                background: linear-gradient(135deg, #0f4c81 0%, #1565c0 100%);
                padding: 1.4rem 1.8rem;
                border-radius: 14px;
                color: white;
                margin-bottom: 1.2rem;
            }
            .portal-header h2 { margin: 0; font-size: 1.6rem; }
            .portal-header p  { margin: 0.3rem 0 0; opacity: 0.85; font-size: 0.95rem; }

            .approval-box {
                border: 2px solid #e53935;
                border-radius: 12px;
                padding: 1rem 1.2rem;
                background: #fff5f5;
                margin-bottom: 1rem;
            }
            .approval-box.approved {
                border-color: #2e7d32;
                background: #f1f8e9;
            }

            .chat-msg-user {
                background: #e3f2fd;
                border-radius: 12px 12px 2px 12px;
                padding: 0.7rem 1rem;
                margin: 0.4rem 0;
                max-width: 78%;
                margin-left: auto;
            }
            .chat-msg-assistant {
                background: #f3f4f6;
                border-radius: 12px 12px 12px 2px;
                padding: 0.7rem 1rem;
                margin: 0.4rem 0;
                max-width: 78%;
            }
            .badge-approved {
                display: inline-block;
                background: #2e7d32;
                color: white;
                border-radius: 20px;
                padding: 2px 12px;
                font-size: 0.78rem;
                font-weight: 700;
                margin-left: 8px;
            }
            .badge-pending {
                display: inline-block;
                background: #e53935;
                color: white;
                border-radius: 20px;
                padding: 2px 12px;
                font-size: 0.78rem;
                font-weight: 700;
                margin-left: 8px;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
        <div class="portal-header">
            <h2>🤰 Patient Nutrition Portal</h2>
            <p>AI-powered clinical nutrition for pregnant women & chronic illness patients</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Session state ─────────────────────────────────────────────────────────
    if "patient_messages" not in st.session_state:
        st.session_state.patient_messages = []
    if "doctor_approved" not in st.session_state:
        st.session_state.doctor_approved = False
    if "plan_sent" not in st.session_state:
        st.session_state.plan_sent = False

    client = get_openai_client()

    # ── Layout: Chat (left) | Controls (right) ────────────────────────────────
    chat_col, ctrl_col = st.columns([3, 1], gap="medium")

    # ────────── RIGHT COLUMN – Doctor Approval Panel ──────────────────────────
    with ctrl_col:
        st.markdown("### ⚙️ Controls")

        approved = st.toggle(
            "Doctor Approval",
            value=st.session_state.doctor_approved,
            help="A supervising doctor must toggle this ON before the final meal plan can be sent to the patient.",
        )
        st.session_state.doctor_approved = approved

        approval_status = "approved" if approved else ""
        badge = (
            '<span class="badge-approved">✔ Approved</span>'
            if approved
            else '<span class="badge-pending">✘ Pending</span>'
        )
        st.markdown(
            f"""
            <div class="approval-box {approval_status}">
                <strong>Doctor Approval</strong>{badge}<br>
                <small>{"Meal plans are cleared to be sent to the patient." if approved
                         else "Toggle ON to authorise sending the final meal plan."}</small>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown("---")
        st.markdown("**📋 Session Info**")
        st.caption(f"Messages in session: **{len(st.session_state.patient_messages)}**")
        st.caption(f"Plan sent: **{'Yes ✅' if st.session_state.plan_sent else 'No ⏳'}**")

        if st.button("🗑️ Clear Chat", use_container_width=True):
            st.session_state.patient_messages = []
            st.session_state.plan_sent = False
            st.rerun()

    # ────────── LEFT COLUMN – Chat Interface ──────────────────────────────────
    with chat_col:
        # Welcome message
        if not st.session_state.patient_messages:
            st.info(
                "👋 Hello! I'm **Dr. NutriCare**, your AI clinical nutritionist. "
                "Tell me about your health condition, trimester, any allergies, and your dietary preferences, "
                "and I'll create a personalised meal plan for you.",
                icon="🩺",
            )

        # Render chat history
        for msg in st.session_state.patient_messages:
            with st.chat_message(msg["role"], avatar="🧑‍⚕️" if msg["role"] == "assistant" else "🧑"):
                st.markdown(msg["content"])

        # Chat input
        user_input = st.chat_input(
            "Describe your condition, ask for a meal plan, or ask a nutrition question…"
        )

        if user_input:
            # Add user message
            st.session_state.patient_messages.append(
                {"role": "user", "content": user_input}
            )
            with st.chat_message("user", avatar="🧑"):
                st.markdown(user_input)

            # Call OpenAI
            with st.chat_message("assistant", avatar="🧑‍⚕️"):
                with st.spinner("Dr. NutriCare is preparing your response…"):
                    response = client.chat.completions.create(
                        model="gpt-4o",
                        messages=[{"role": "system", "content": SYSTEM_PROMPT}]
                        + st.session_state.patient_messages,
                        temperature=0.5,
                        max_tokens=1500,
                    )
                    reply = response.choices[0].message.content
                st.markdown(reply)

            st.session_state.patient_messages.append(
                {"role": "assistant", "content": reply}
            )

        # ── Send Meal Plan button (requires Doctor Approval) ──────────────────
        if st.session_state.patient_messages:
            st.markdown("---")
            send_col, status_col = st.columns([2, 3])
            with send_col:
                send_clicked = st.button(
                    "📨 Send Final Meal Plan to Patient",
                    disabled=not st.session_state.doctor_approved,
                    use_container_width=True,
                    type="primary",
                )
            with status_col:
                if not st.session_state.doctor_approved:
                    st.warning(
                        "⚠️ Enable **Doctor Approval** in the controls panel to unlock this button.",
                        icon="🔒",
                    )
                elif st.session_state.plan_sent:
                    st.success("✅ Meal plan successfully sent to the patient!", icon="📬")

            if send_clicked and st.session_state.doctor_approved:
                st.session_state.plan_sent = True
                st.success(
                    "✅ **Meal plan sent!** The patient has been notified. "
                    "A copy has been logged for the supervising doctor.",
                    icon="📬",
                )
                st.balloons()
