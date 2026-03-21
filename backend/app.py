"""
app.py  ·  MedNutri Streamlit Backend
──────────────────────────────────────
Navigation mirrors the Next.js frontend exactly:
  Overview  |  Patient Portal  |  Kitchen Command  |  Doc Monitor
"""
import streamlit as st
from utils.styles import inject_css, SAGE, TEAL, AMBER, CRIMSON
from data.mock_data import OVERVIEW_STATS

st.set_page_config(
    page_title="MedNutri | Healthcare Dashboard",
    page_icon="🥗",
    layout="wide",
    initial_sidebar_state="expanded",
)

inject_css()

# ── Sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown(
        """
        <div style="text-align:center;padding:0.8rem 0 1.2rem;">
          <span style="font-size:2rem;">🥗</span>
          <div style="font-size:1.3rem;font-weight:800;margin-top:0.3rem;">MedNutri</div>
          <div style="font-size:0.78rem;opacity:0.75;margin-top:0.1rem;">Healthcare Dashboard</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown("---")

    page = st.radio(
        "Navigate",
        [
            "🏠  Overview",
            "🤰  Patient Portal",
            "🍲  Kitchen Command",
            "🩺  Doc Monitor",
        ],
        label_visibility="collapsed",
    )

    st.markdown("---")

    # Mini KPI strip in sidebar
    stats = OVERVIEW_STATS
    st.markdown(
        f"""
        <div style="font-size:0.72rem;text-transform:uppercase;letter-spacing:.07em;
                    opacity:0.65;margin-bottom:0.5rem;">Live Stats</div>
        <div style="display:flex;flex-direction:column;gap:0.35rem;">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span>Patients</span><strong>{stats['total_patients']}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span>Active Orders</span><strong>{stats['active_orders']}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span>Pending Approvals</span>
            <strong style="color:{AMBER};">{stats['pending_approvals']}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
            <span>Critical Alerts</span>
            <strong style="color:{CRIMSON};">{stats['critical_alerts']}</strong>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("---")
    st.caption("© 2026 MedNutri · v2.0.0")

# ── Route ────────────────────────────────────────────────────────────────────
if "Overview" in page:
    from pages.overview import render
    render()
elif "Patient" in page:
    from pages.patient_portal import render
    render()
elif "Kitchen" in page:
    from pages.kitchen_command import render
    render()
elif "Doc" in page:
    from pages.doc_monitor import render
    render()
