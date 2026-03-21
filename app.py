import streamlit as st

# ── Page config (must be first Streamlit call) ──────────────────────────────
st.set_page_config(
    page_title="MedNutri Demo",
    page_icon="🥗",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Global CSS ───────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
        /* Sidebar */
        [data-testid="stSidebar"] {
            background: linear-gradient(160deg, #0f4c81 0%, #1a7a4a 100%);
        }
        [data-testid="stSidebar"] * {
            color: #ffffff !important;
        }
        [data-testid="stSidebar"] .stRadio label {
            font-size: 1.05rem;
            font-weight: 500;
        }

        /* Page heading */
        .home-title {
            text-align: center;
            font-size: 2.6rem;
            font-weight: 800;
            background: linear-gradient(90deg, #0f4c81, #1a7a4a);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.3rem;
        }
        .home-sub {
            text-align: center;
            font-size: 1.1rem;
            color: #555;
            margin-bottom: 2rem;
        }

        /* Cards */
        .card {
            border-radius: 16px;
            padding: 2rem 1.8rem;
            margin: 0.5rem;
            background: #f8fffe;
            border: 1px solid #d4edda;
            box-shadow: 0 4px 16px rgba(0,0,0,0.07);
            transition: transform 0.2s;
        }
        .card:hover { transform: translateY(-4px); }
        .card-icon { font-size: 2.8rem; margin-bottom: 0.5rem; }
        .card-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: #0f4c81;
            margin-bottom: 0.4rem;
        }
        .card-desc { color: #444; font-size: 0.95rem; line-height: 1.6; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Sidebar Navigation ───────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🥗 MedNutri")
    st.markdown("---")
    page = st.radio(
        "Navigate to",
        ["🏠 Home", "🤰 Patient Nutrition Portal", "🍲 NGO Kitchen Portal"],
        index=0,
    )
    st.markdown("---")
    st.caption("© 2026 MedNutri · Demo Build")

# ── Route pages ──────────────────────────────────────────────────────────────
if page == "🏠 Home":
    st.markdown('<p class="home-title">MedNutri Platform</p>', unsafe_allow_html=True)
    st.markdown(
        '<p class="home-sub">AI-powered clinical nutrition — bridging patients, doctors & community kitchens</p>',
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown(
            """
            <div class="card">
                <div class="card-icon">🤰</div>
                <div class="card-title">Patient Nutrition Portal</div>
                <div class="card-desc">
                    A clinical AI nutritionist specialised in <strong>pregnant women</strong>
                    and patients with <strong>chronic illness</strong>. Get personalised meal
                    plans with integrated <em>Doctor Approval</em> workflow before any plan
                    is finalised.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            """
            <div class="card">
                <div class="card-icon">🍲</div>
                <div class="card-title">NGO Kitchen Portal</div>
                <div class="card-desc">
                    An AI culinary guide for <strong>NGO kitchen workers</strong>. Scale
                    recipes for large batches, explore ingredient substitutions for
                    local availability, and maintain strict <em>food hygiene standards</em>.
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("<br>", unsafe_allow_html=True)
    st.info(
        "👈 Use the sidebar to navigate between portals.",
        icon="ℹ️",
    )

elif page == "🤰 Patient Nutrition Portal":
    from pages.patient_nutrition_portal import render
    render()

elif page == "🍲 NGO Kitchen Portal":
    from pages.ngo_kitchen_portal import render
    render()
