"""
NGO Kitchen Portal
──────────────────
AI Culinary Guide for NGO kitchen workers.
Helps with recipe scaling, ingredient substitutions, and food hygiene.
"""

import os
import streamlit as st
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ── System prompt ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are ChefAid, an expert AI culinary guide deployed to assist NGO kitchen 
workers and community meal program staff. Your expertise covers:

1. RECIPE SCALING
   • Scale any recipe from a small household portion to large batches
     (50, 100, 500+ servings) with precise ingredient quantities.
   • Adjust cooking times, vessel sizes, and heat levels for bulk cooking.
   • Highlight ingredients where bulk scaling changes the recipe dynamics
     (e.g., salt, spices, leavening agents do NOT scale linearly).

2. INGREDIENT SUBSTITUTIONS
   • Suggest locally available, budget-friendly substitutes for hard-to-find
     or expensive ingredients — especially in low-resource settings.
   • Flag allergy-safe alternatives (gluten-free, nut-free, dairy-free) when
     serving vulnerable populations.
   • Maintain nutritional equivalency in substitutions wherever possible.

3. FOOD HYGIENE & SAFETY STANDARDS
   • Guide workers on safe food temperatures (cooking, storage, reheating).
   • Advise on cross-contamination prevention, FIFO (First In, First Out)
     stock rotation, and personal hygiene protocols.
   • Recommend safe holding times for cooked food during meal service.
   • Provide guidance aligned with WHO/FSSAI/local food safety standards.

4. GENERAL CULINARY SUPPORT
   • Nutritious, low-cost meal ideas for large groups.
   • Batch cooking scheduling and kitchen workflow optimisation.

Always be practical, clear, and concise. Use bullet points and tables where
they improve clarity. Remember your audience may have limited culinary
training — keep language simple and actionable.
""".strip()

# ── Quick-access prompt cards ─────────────────────────────────────────────────
QUICK_PROMPTS = [
    ("📐 Scale a Recipe", "I need to scale a dal recipe from 4 servings to 200 servings. How do I adjust quantities and cooking time?"),
    ("🔄 Substitute Ingredient", "We don't have paneer today. What can I substitute in a palak paneer recipe for 150 people while keeping it nutritious?"),
    ("🧼 Hygiene Checklist", "Give me a daily food hygiene and safety checklist for our NGO kitchen that serves 300 meals per day."),
    ("🌡️ Safe Temperatures", "What are the safe cooking and storage temperatures for rice, lentils, and cooked vegetables for bulk meal service?"),
]


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
    # ── Page styling ──────────────────────────────────────────────────────────
    st.markdown(
        """
        <style>
            .ngo-header {
                background: linear-gradient(135deg, #1a7a4a 0%, #2e7d32 100%);
                padding: 1.4rem 1.8rem;
                border-radius: 14px;
                color: white;
                margin-bottom: 1.2rem;
            }
            .ngo-header h2 { margin: 0; font-size: 1.6rem; }
            .ngo-header p  { margin: 0.3rem 0 0; opacity: 0.85; font-size: 0.95rem; }

            .quick-card {
                border: 1.5px solid #a5d6a7;
                border-radius: 10px;
                padding: 0.6rem 0.9rem;
                margin-bottom: 0.5rem;
                background: #f1f8e9;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background 0.2s;
            }
            .quick-card:hover { background: #dcedc8; }

            .stats-box {
                background: #e8f5e9;
                border-radius: 10px;
                padding: 0.8rem 1rem;
                text-align: center;
                border: 1px solid #c8e6c9;
            }
            .stats-num {
                font-size: 1.8rem;
                font-weight: 800;
                color: #1a7a4a;
            }
            .stats-label { font-size: 0.78rem; color: #555; }
        </style>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
        <div class="ngo-header">
            <h2>🍲 NGO Kitchen Portal</h2>
            <p>AI culinary guide for scaling recipes, ingredient substitutions & food safety</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Session state ─────────────────────────────────────────────────────────
    if "ngo_messages" not in st.session_state:
        st.session_state.ngo_messages = []
    if "ngo_quick_input" not in st.session_state:
        st.session_state.ngo_quick_input = None

    client = get_openai_client()

    # ── Layout: Chat (left) | Sidebar tools (right) ───────────────────────────
    chat_col, tool_col = st.columns([3, 1], gap="medium")

    # ────────── RIGHT COLUMN – Quick Prompts & Stats ──────────────────────────
    with tool_col:
        st.markdown("### ⚡ Quick Questions")
        st.caption("Click to auto-fill a common question:")
        for label, prompt_text in QUICK_PROMPTS:
            if st.button(label, use_container_width=True):
                st.session_state.ngo_quick_input = prompt_text
                st.rerun()

        st.markdown("---")
        st.markdown("### 📊 Session Stats")

        user_msgs = sum(
            1 for m in st.session_state.ngo_messages if m["role"] == "user"
        )
        c1, c2 = st.columns(2)
        with c1:
            st.markdown(
                f'<div class="stats-box"><div class="stats-num">{user_msgs}</div>'
                f'<div class="stats-label">Questions</div></div>',
                unsafe_allow_html=True,
            )
        with c2:
            st.markdown(
                f'<div class="stats-box"><div class="stats-num">{user_msgs}</div>'
                f'<div class="stats-label">Answers</div></div>',
                unsafe_allow_html=True,
            )

        st.markdown("---")
        st.markdown("### 🧰 Resources")
        with st.expander("📌 Hygiene Quick Ref"):
            st.markdown(
                """
                | Zone | Safe Temp |
                |------|-----------|
                | Cooking | ≥ 75 °C |
                | Hot Hold | ≥ 60 °C |
                | Cold Hold | ≤ 5 °C |
                | Danger Zone | 5–60 °C |
                """
            )

        with st.expander("📌 Scaling Rules of Thumb"):
            st.markdown(
                """
                - **Salt & spices**: scale to ~70–80% of linear amount; taste & adjust
                - **Baking powder/soda**: scale to ~75%
                - **Cooking time**: does NOT scale linearly — monitor closely
                - **Oil**: scale to ~80–90% for sautéing in large pans
                """
            )

        if st.button("🗑️ Clear Chat", use_container_width=True):
            st.session_state.ngo_messages = []
            st.session_state.ngo_quick_input = None
            st.rerun()

    # ────────── LEFT COLUMN – Chat Interface ──────────────────────────────────
    with chat_col:
        if not st.session_state.ngo_messages:
            st.info(
                "👨‍🍳 Hello! I'm **ChefAid**, your NGO kitchen assistant. "
                "Ask me to scale a recipe, find ingredient substitutes, or get food safety guidance. "
                "Use the **Quick Questions** panel on the right to get started fast!",
                icon="🍳",
            )

        # Render chat history
        for msg in st.session_state.ngo_messages:
            avatar = "👨‍🍳" if msg["role"] == "assistant" else "👤"
            with st.chat_message(msg["role"], avatar=avatar):
                st.markdown(msg["content"])

        # Handle quick-prompt injection
        pending_input = st.session_state.pop("ngo_quick_input", None)

        user_input = st.chat_input(
            "Ask about recipe scaling, substitutions, or kitchen hygiene…"
        )

        # Use quick prompt if set, otherwise use typed input
        final_input = pending_input or user_input

        if final_input:
            st.session_state.ngo_messages.append(
                {"role": "user", "content": final_input}
            )
            with st.chat_message("user", avatar="👤"):
                st.markdown(final_input)

            with st.chat_message("assistant", avatar="👨‍🍳"):
                with st.spinner("ChefAid is thinking…"):
                    response = client.chat.completions.create(
                        model="gpt-4o",
                        messages=[{"role": "system", "content": SYSTEM_PROMPT}]
                        + st.session_state.ngo_messages,
                        temperature=0.4,
                        max_tokens=1500,
                    )
                    reply = response.choices[0].message.content
                st.markdown(reply)

            st.session_state.ngo_messages.append(
                {"role": "assistant", "content": reply}
            )

            # If quick prompt was used, rerun to refresh stats
            if pending_input:
                st.rerun()
