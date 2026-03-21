import streamlit as st
from data.mock_data import MEAL_ORDERS, MEALS
from utils.styles import inject_css, SAGE, TEAL, AMBER, CRIMSON
from utils.openai_client import chat

CHEF_SYSTEM_PROMPT = """You are ChefAid, an expert AI culinary guide deployed to assist NGO kitchen workers and community meal program staff. Your expertise covers:

1. RECIPE SCALING: Scale any recipe from household portion to large batches (50, 100, 500+ servings). Adjust cooking times and vessel sizes. Note: salt/spices/leavening agents do NOT scale linearly.
2. INGREDIENT SUBSTITUTIONS: Suggest locally available, budget-friendly substitutes. Flag allergy-safe alternatives. Maintain nutritional equivalency.
3. FOOD HYGIENE & SAFETY: Guide on safe temperatures (cook ≥75°C, hot hold ≥60°C, cold ≤5°C). Cross-contamination prevention, FIFO rotation, personal hygiene. WHO/FSSAI-aligned.
4. GENERAL CULINARY: Nutritious low-cost meal ideas, batch cooking scheduling, kitchen workflow optimisation.

Be practical, clear, and concise. Use bullet points and tables where helpful."""


def render():
    inject_css()

    # ── Session state initialisation ─────────────────────────────────────────
    if "ngo_messages" not in st.session_state:
        st.session_state.ngo_messages = []
    if "ngo_selected_order_id" not in st.session_state:
        st.session_state.ngo_selected_order_id = MEAL_ORDERS[0]["id"]
    if "ngo_quick_input" not in st.session_state:
        st.session_state.ngo_quick_input = None

    # ── Page header ──────────────────────────────────────────────────────────
    st.markdown(
        f"""
        <div class="page-header header-amber">
            <h1>🍲 Kitchen Command</h1>
            <p>{len(MEAL_ORDERS)} Active Orders · Production Active</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Active orders summary bar ────────────────────────────────────────────
    STATUS_COLORS = {
        "pending": AMBER,
        "preparing": SAGE,
        "ready": TEAL,
        "delivered": TEAL,
    }

    summary_cols = st.columns(4)
    for i, order in enumerate(MEAL_ORDERS[:4]):
        status = order.get("status", "pending").lower()
        color = STATUS_COLORS.get(status, AMBER)
        with summary_cols[i]:
            st.markdown(
                f"""
                <div style="
                    background:{color}22;
                    border:1px solid {color};
                    border-radius:12px;
                    padding:8px 10px;
                    text-align:center;
                    margin-bottom:4px;
                ">
                    <span style="font-weight:600;font-size:0.82rem;">{order.get('patient_name', 'Patient')}</span><br>
                    <span style="
                        background:{color};
                        color:#fff;
                        border-radius:8px;
                        padding:1px 8px;
                        font-size:0.72rem;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:0.04em;
                    ">{status}</span>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown("<div style='margin-bottom:12px'></div>", unsafe_allow_html=True)

    # ── Main layout ──────────────────────────────────────────────────────────
    orders_col, recipe_col, chat_col = st.columns([1, 1, 1], gap="medium")

    # ════════════════════════════════════════════════════════════════════════
    # ORDERS COLUMN
    # ════════════════════════════════════════════════════════════════════════
    with orders_col:
        st.markdown("### 📋 Active Orders")

        PROGRESS = {
            "pending": 25,
            "preparing": 55,
            "ready": 100,
            "delivered": 100,
        }

        for order in MEAL_ORDERS:
            oid = order["id"]
            status = order.get("status", "pending").lower()
            color = STATUS_COLORS.get(status, AMBER)
            progress = PROGRESS.get(status, 25)
            is_selected = st.session_state.ngo_selected_order_id == oid

            border_style = f"3px solid {TEAL}" if is_selected else f"1px solid {color}44"
            bg_style = f"{TEAL}0d" if is_selected else "#ffffff08"

            st.markdown(
                f"""
                <div class="order-card{'selected' if is_selected else ''}" style="
                    border:{border_style};
                    background:{bg_style};
                    border-radius:10px;
                    padding:10px 12px;
                    margin-bottom:4px;
                ">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-weight:700;font-size:0.88rem;">{order.get('patient_name','Patient')}</span>
                        <span style="
                            background:{color};
                            color:#fff;
                            border-radius:8px;
                            padding:1px 8px;
                            font-size:0.70rem;
                            font-weight:600;
                            text-transform:uppercase;
                        ">{status}</span>
                    </div>
                    <div style="font-size:0.78rem;color:#888;margin-bottom:2px;">
                        🍽 {order.get('meal_type','Meal')} &nbsp;·&nbsp; ⏰ {order.get('due_time','—')} &nbsp;·&nbsp; ×{order.get('quantity',1)}
                    </div>
                    <div style="background:#e0e0e022;border-radius:4px;height:6px;margin-top:6px;">
                        <div style="background:{color};width:{progress}%;height:6px;border-radius:4px;"></div>
                    </div>
                    <div style="font-size:0.70rem;color:#aaa;margin-top:2px;text-align:right;">{progress}%</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            if st.button(
                f"Select →  {oid}",
                key=f"sel_{oid}",
                use_container_width=True,
            ):
                st.session_state.ngo_selected_order_id = oid
                st.rerun()

    # ════════════════════════════════════════════════════════════════════════
    # RECIPE COLUMN
    # ════════════════════════════════════════════════════════════════════════
    with recipe_col:
        st.markdown("### 📖 Recipe Guide")

        # Find selected order
        selected_order = next(
            (o for o in MEAL_ORDERS if o["id"] == st.session_state.ngo_selected_order_id),
            MEAL_ORDERS[0],
        )
        meal_type_kw = selected_order.get("meal_type", "").lower()

        # Find matching meal
        matched_meal = None
        for m in MEALS:
            if meal_type_kw and meal_type_kw in m.get("name", "").lower():
                matched_meal = m
                break
        if matched_meal is None:
            matched_meal = MEALS[0]

        meal_name = matched_meal.get("name", "Meal")
        calories = matched_meal.get("calories", 0)
        serving_size = matched_meal.get("serving_size", 250)
        ingredients = matched_meal.get("ingredients", [])

        # Meal name with gradient
        st.markdown(
            f"""
            <h3 style="
                background: linear-gradient(90deg, {SAGE}, {TEAL});
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom:8px;
            ">{meal_name}</h3>
            """,
            unsafe_allow_html=True,
        )

        # Badges
        badge_style = (
            "display:inline-block;padding:3px 12px;border-radius:20px;"
            "font-size:0.78rem;font-weight:600;margin-right:6px;margin-bottom:8px;"
        )
        st.markdown(
            f"""
            <div>
                <span style="{badge_style}background:{SAGE}22;color:{SAGE};border:1px solid {SAGE};">⏱ 30 min</span>
                <span style="{badge_style}background:{AMBER}22;color:{AMBER};border:1px solid {AMBER};">🔥 {calories} cal</span>
                <span style="{badge_style}background:{TEAL}22;color:{TEAL};border:1px solid {TEAL};">📏 {serving_size}g</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Ingredients
        if ingredients:
            st.markdown("**Ingredients**")
            for ing in ingredients:
                name = ing if isinstance(ing, str) else ing.get("name", str(ing))
                st.markdown(
                    f"""
                    <div class="recipe-ingredient" style="
                        display:flex;align-items:center;gap:8px;
                        padding:4px 0;font-size:0.84rem;
                    ">
                        <span class="recipe-dot" style="
                            width:8px;height:8px;border-radius:50%;
                            background:{SAGE};display:inline-block;flex-shrink:0;
                        "></span>
                        {name}
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
        else:
            st.markdown("*No ingredient details available.*")

        # Batch scaling table
        st.markdown("**⚖️ Batch Scaling**")
        try:
            sz = int(serving_size)
        except (ValueError, TypeError):
            sz = 250

        scaling_data = {
            "Batch": ["1×", "5×", "10×"],
            "Quantity": [f"{sz} g", f"{sz * 5} g", f"{sz * 10} g"],
        }
        st.table(scaling_data)

        st.markdown(
            f"""
            <div style="
                background:{AMBER}22;border-left:3px solid {AMBER};
                padding:6px 10px;border-radius:0 6px 6px 0;
                font-size:0.80rem;margin-bottom:8px;
            ">
                ⏱️ Increase cooking time by 10–15% for larger batches
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Hygiene quick-reference
        with st.expander("🧼 Hygiene Quick Ref"):
            st.table(
                {
                    "Zone": ["Cooking", "Hot Hold", "Cold Hold", "Danger Zone"],
                    "Safe Temp": ["≥ 75 °C", "≥ 60 °C", "≤ 5 °C", "5–60 °C"],
                }
            )

    # ════════════════════════════════════════════════════════════════════════
    # CHAT COLUMN
    # ════════════════════════════════════════════════════════════════════════
    with chat_col:
        st.markdown("### 👨‍🍳 ChefAid Assistant")

        # Quick action buttons
        qa_col1, qa_col2 = st.columns(2)
        with qa_col1:
            if st.button("📐 Scale Recipe", use_container_width=True, key="qa_scale"):
                st.session_state.ngo_quick_input = (
                    "How do I scale this dal recipe from 4 to 200 servings?"
                )
                st.rerun()
            if st.button("🧼 Hygiene Check", use_container_width=True, key="qa_hygiene"):
                st.session_state.ngo_quick_input = (
                    "Give me a daily hygiene checklist for an NGO kitchen serving 300 meals."
                )
                st.rerun()
        with qa_col2:
            if st.button("🔄 Substitute", use_container_width=True, key="qa_sub"):
                st.session_state.ngo_quick_input = (
                    "What can I substitute for paneer in a recipe for 150 people?"
                )
                st.rerun()
            if st.button("🌡️ Safe Temps", use_container_width=True, key="qa_temps"):
                st.session_state.ngo_quick_input = (
                    "What are safe cooking and storage temperatures for rice, lentils, and vegetables?"
                )
                st.rerun()

        st.markdown("<div style='margin-bottom:8px'></div>", unsafe_allow_html=True)

        # Chat message display
        messages = st.session_state.ngo_messages
        if not messages:
            st.info("👨‍🍳 ChefAid ready! Use quick buttons or type a question.")
        else:
            chat_html_parts = []
            for msg in messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role == "user":
                    bubble = (
                        f'<div class="chat-user" style="'
                        f"background:{TEAL}22;border:1px solid {TEAL}44;"
                        f"border-radius:12px 12px 2px 12px;padding:8px 12px;"
                        f"margin:4px 0 4px 20%;font-size:0.84rem;text-align:right;"
                        f'">{content}</div>'
                    )
                elif role == "assistant":
                    bubble = (
                        f'<div class="chat-bot" style="'
                        f"background:{SAGE}22;border:1px solid {SAGE}44;"
                        f"border-radius:12px 12px 12px 2px;padding:8px 12px;"
                        f"margin:4px 20% 4px 0;font-size:0.84rem;"
                        f'">{content}</div>'
                    )
                else:
                    bubble = (
                        f'<div class="chat-sys" style="'
                        f"background:#88888822;border-radius:8px;padding:6px 10px;"
                        f"margin:4px 0;font-size:0.78rem;color:#aaa;text-align:center;"
                        f'">{content}</div>'
                    )
                chat_html_parts.append(bubble)

            st.markdown(
                f"""
                <div style="
                    max-height:340px;overflow-y:auto;
                    padding:8px;border:1px solid #33333355;
                    border-radius:10px;margin-bottom:8px;
                ">
                    {''.join(chat_html_parts)}
                </div>
                """,
                unsafe_allow_html=True,
            )

        # Handle input
        user_input = st.chat_input("Ask about scaling, substitutions, hygiene…")
        final_input = st.session_state.ngo_quick_input or user_input

        if final_input:
            st.session_state.ngo_quick_input = None
            st.session_state.ngo_messages.append({"role": "user", "content": final_input})

            try:
                with st.spinner("ChefAid is thinking…"):
                    reply = chat(CHEF_SYSTEM_PROMPT, st.session_state.ngo_messages)
            except Exception as e:
                reply = f"⚠️ Sorry, I encountered an error: {str(e)}"

            st.session_state.ngo_messages.append({"role": "assistant", "content": reply})
            st.rerun()

        # Session stats
        st.markdown("<div style='margin-top:8px'></div>", unsafe_allow_html=True)
        question_count = sum(
            1 for m in st.session_state.ngo_messages if m.get("role") == "user"
        )
        st.markdown(
            f'<div style="font-size:0.78rem;color:#888;">Questions asked: {question_count}</div>',
            unsafe_allow_html=True,
        )

        if st.session_state.ngo_messages:
            if st.button("🗑️ Clear Chat", key="ngo_clear_chat", use_container_width=True):
                st.session_state.ngo_messages = []
                st.rerun()
