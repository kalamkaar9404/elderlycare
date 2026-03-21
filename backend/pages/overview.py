"""
overview.py — MedNutri Dashboard Overview Page
Mirrors the /overview route of the Next.js MedTech Hub frontend.
Provides a unified snapshot: active patient, kitchen orders, and doctor alerts.
"""

import streamlit as st
import pandas as pd
from datetime import datetime

from data.mock_data import PATIENTS, MEAL_ORDERS, ALERTS, AI_MEAL_PLAN, OVERVIEW_STATS, VITALS
from utils.styles import inject_css, SAGE, TEAL, AMBER, CRIMSON


def render():
    # ─────────────────────────────────────────────
    # 1. Inject global CSS
    # ─────────────────────────────────────────────
    inject_css()

    # ─────────────────────────────────────────────
    # 2. Page Header — gradient banner
    # ─────────────────────────────────────────────
    st.markdown(
        f"""
        <div style="
            background: linear-gradient(135deg, {SAGE} 0%, {TEAL} 100%);
            border-radius: 16px;
            padding: 2rem 2.5rem;
            margin-bottom: 1.8rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        ">
            <h1 style="color:#ffffff; margin:0; font-size:2.2rem; font-weight:700; letter-spacing:-0.5px;">
                🏠 MedTech Hub
            </h1>
            <p style="color:rgba(255,255,255,0.88); margin:0.5rem 0 0; font-size:1.05rem;">
                Integrated patient care, nutrition management, and health supervision
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ─────────────────────────────────────────────
    # 3. KPI Tiles — four metrics in one row
    # ─────────────────────────────────────────────
    kpi_col1, kpi_col2, kpi_col3, kpi_col4 = st.columns(4)

    # Helper: build a KPI tile HTML block
    def kpi_tile(label: str, value, accent: str) -> str:
        return f"""
        <div class="kpi-tile" style="border-top: 4px solid {accent};">
            <div class="kpi-num" style="color:{accent};">{value}</div>
            <div class="kpi-label">{label}</div>
        </div>
        """

    with kpi_col1:
        st.markdown(
            kpi_tile("Total Patients", OVERVIEW_STATS["total_patients"], TEAL),
            unsafe_allow_html=True,
        )

    with kpi_col2:
        st.markdown(
            kpi_tile("Active Orders", OVERVIEW_STATS["active_orders"], AMBER),
            unsafe_allow_html=True,
        )

    with kpi_col3:
        st.markdown(
            kpi_tile("Pending Approvals", OVERVIEW_STATS["pending_approvals"], AMBER),
            unsafe_allow_html=True,
        )

    with kpi_col4:
        st.markdown(
            kpi_tile("Critical Alerts", OVERVIEW_STATS["critical_alerts"], CRIMSON),
            unsafe_allow_html=True,
        )

    st.markdown("<br>", unsafe_allow_html=True)

    # ─────────────────────────────────────────────
    # 4. Three-column main layout
    # ─────────────────────────────────────────────
    col_patient, col_kitchen, col_guardian = st.columns([1, 1, 1])

    # ══════════════════════════════════════════════
    # COLUMN 1 — The Patient
    # ══════════════════════════════════════════════
    with col_patient:
        st.markdown(
            f"<h3 style='color:{TEAL}; margin-bottom:0.8rem;'>👤 Active Patient</h3>",
            unsafe_allow_html=True,
        )

        # Pick the first patient from mock data
        patient = PATIENTS[0]

        # Risk badge colour mapping
        risk_colours = {
            "low":    TEAL,
            "medium": AMBER,
            "high":   CRIMSON,
        }
        risk_level = patient.get("risk_level", "low").lower()
        risk_colour = risk_colours.get(risk_level, SAGE)

        # Patient info card
        st.markdown(
            f"""
            <div class="mn-card">
                <h4 style="margin:0 0 0.5rem; font-size:1.15rem;">{patient.get("name", "—")}</h4>
                <p style="margin:0.2rem 0; color:#555;">
                    🎂 Age: <strong>{patient.get("age", "—")}</strong>
                </p>
                <p style="margin:0.2rem 0; color:#555;">
                    🤰 Pregnancy Week: <strong>{patient.get("pregnancy_week", "—")}</strong>
                </p>
                <span style="
                    display:inline-block;
                    margin-top:0.6rem;
                    padding:0.25rem 0.75rem;
                    border-radius:20px;
                    background:{risk_colour}22;
                    color:{risk_colour};
                    font-weight:600;
                    font-size:0.85rem;
                    border:1px solid {risk_colour}55;
                ">
                    ⚠️ {risk_level.capitalize()} Risk
                </span>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Customised meal plan card
        st.markdown(
            f"""
            <div class="mn-card" style="margin-top:1rem; border-left:4px solid {SAGE};">
                <h5 style="margin:0 0 0.5rem; color:{SAGE};">📋 Customized Meal Plan</h5>
                <p style="margin:0.15rem 0; font-weight:600; font-size:0.95rem;">High-Protein Focus</p>
                <p style="margin:0.15rem 0; color:#666; font-size:0.88rem;">
                    Optimized for pregnancy week {patient.get("pregnancy_week", "—")}
                </p>
                <hr style="border:none; border-top:1px solid #eee; margin:0.6rem 0;">
                <p style="margin:0.15rem 0; font-size:0.9rem;">🔥 Daily Calories: <strong>2,400 kcal</strong></p>
                <p style="margin:0.15rem 0; font-size:0.9rem; color:#555;">
                    Protein 90g &nbsp;·&nbsp; Carbs 300g &nbsp;·&nbsp; Fat 70g
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Smartwatch sync status line
        st.markdown(
            f"""
            <div style="
                display:flex; align-items:center; gap:0.5rem;
                margin-top:0.9rem; padding:0.5rem 0.75rem;
                background:{TEAL}12; border-radius:8px;
                font-size:0.88rem; color:{TEAL}; font-weight:500;
            ">
                <span style="
                    width:10px; height:10px; border-radius:50%;
                    background:{TEAL};
                    animation:pulse 1.5s infinite;
                    display:inline-block;
                "></span>
                🟢 Smartwatch Sync Active
            </div>
            <style>
                @keyframes pulse {{
                    0%   {{ box-shadow: 0 0 0 0 {TEAL}66; }}
                    70%  {{ box-shadow: 0 0 0 8px {TEAL}00; }}
                    100% {{ box-shadow: 0 0 0 0 {TEAL}00; }}
                }}
            </style>
            """,
            unsafe_allow_html=True,
        )

    # ══════════════════════════════════════════════
    # COLUMN 2 — The Kitchen
    # ══════════════════════════════════════════════
    with col_kitchen:
        st.markdown(
            f"<h3 style='color:{SAGE}; margin-bottom:0.8rem;'>🍲 Kitchen Supply</h3>",
            unsafe_allow_html=True,
        )

        # Status colour + progress bar width mapping
        status_cfg = {
            "pending":   {"colour": AMBER,  "width": "25%"},
            "preparing": {"colour": SAGE,   "width": "55%"},
            "ready":     {"colour": TEAL,   "width": "100%"},
            "delivered": {"colour": TEAL,   "width": "100%"},
        }

        # Build order rows HTML
        orders_html = ""
        for order in MEAL_ORDERS:
            status_key = order.get("status", "pending").lower()
            cfg = status_cfg.get(status_key, {"colour": AMBER, "width": "25%"})
            colour = cfg["colour"]
            width  = cfg["width"]

            orders_html += f"""
            <div style="
                padding:0.6rem 0.75rem;
                border-radius:8px;
                background:#fafafa;
                margin-bottom:0.6rem;
                border:1px solid #ececec;
            ">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:600; font-size:0.92rem;">{order.get("patient_name","—")}</span>
                    <span style="
                        padding:0.15rem 0.55rem;
                        border-radius:12px;
                        font-size:0.78rem;
                        font-weight:600;
                        background:{colour}22;
                        color:{colour};
                        border:1px solid {colour}44;
                    ">{status_key.capitalize()}</span>
                </div>
                <div style="color:#777; font-size:0.82rem; margin:0.2rem 0;">
                    🍽️ {order.get("meal_type","—")} &nbsp;·&nbsp; ⏰ {order.get("due_time","—")}
                </div>
                <div class="progress-bar-wrap">
                    <div class="progress-bar-fill" style="width:{width}; background:{colour};"></div>
                </div>
            </div>
            """

        st.markdown(
            f"""
            <div class="mn-card">
                <h5 style="margin:0 0 0.75rem; color:{SAGE};">📦 Active Orders</h5>
                {orders_html}
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Ingredient source card
        st.markdown(
            f"""
            <div class="mn-card" style="margin-top:1rem; border-left:4px solid {TEAL};">
                <h5 style="margin:0 0 0.4rem; color:{TEAL};">🌾 Ingredient Source</h5>
                <p style="margin:0; font-size:0.9rem; color:#444;">
                    Green Valley Farms
                </p>
                <p style="margin:0.2rem 0 0; font-size:0.82rem; color:#777;">
                    ✔ Steady Income Verified &nbsp;·&nbsp; ✔ Fair Trade Certified
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # ══════════════════════════════════════════════
    # COLUMN 3 — The Guardian
    # ══════════════════════════════════════════════
    with col_guardian:
        st.markdown(
            f"<h3 style='color:{CRIMSON}; margin-bottom:0.8rem;'>🩺 Doctor Guardian</h3>",
            unsafe_allow_html=True,
        )

        # Alert type configuration
        alert_cfg = {
            "critical": {"css_class": "alert-critical", "icon": "🔴"},
            "warning":  {"css_class": "alert-warning",  "icon": "🟡"},
            "info":     {"css_class": "alert-info",      "icon": "🔵"},
        }

        # Filter out resolved alerts
        active_alerts = [a for a in ALERTS if not a.get("resolved", False)]

        if active_alerts:
            alerts_html = ""
            for alert in active_alerts:
                a_type = alert.get("type", "info").lower()
                cfg    = alert_cfg.get(a_type, {"css_class": "alert-info", "icon": "🔵"})
                # Format timestamp as HH:MM if possible
                raw_ts = alert.get("timestamp", "")
                try:
                    ts_fmt = datetime.fromisoformat(str(raw_ts)).strftime("%H:%M")
                except (ValueError, TypeError):
                    ts_fmt = str(raw_ts)

                alerts_html += f"""
                <div class="{cfg['css_class']}" style="margin-bottom:0.5rem;">
                    <span>{cfg['icon']} {alert.get("message","—")}</span>
                    <span style="float:right; font-size:0.8rem; opacity:0.75;">{ts_fmt}</span>
                </div>
                """
        else:
            alerts_html = "<p style='color:#4CAF50; font-weight:600;'>✅ No active alerts</p>"

        st.markdown(
            f"""
            <div class="mn-card">
                <h5 style="margin:0 0 0.75rem; color:{CRIMSON};">🚨 Alert Panel</h5>
                {alerts_html}
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Approve Meal Plan button
        st.markdown("<div style='margin-top:0.9rem;'>", unsafe_allow_html=True)
        if st.button("✅ Approve Meal Plan", use_container_width=True, type="primary"):
            st.success("✅ Meal plan approved and sent to kitchen!")
        st.markdown("</div>", unsafe_allow_html=True)

        # ── 7-Day Vitals Snapshot ──────────────────
        st.markdown(
            f"""
            <div class="mn-card" style="margin-top:1rem; border-left:4px solid {TEAL};">
                <h5 style="margin:0 0 0.5rem; color:{TEAL};">📊 7-Day Vitals Snapshot</h5>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Blood Glucose (mmol/L) — 7 days
        glucose_values = [4.2, 5.1, 4.8, 5.3, 4.9, 5.2, 5.0]
        glucose_df = pd.DataFrame(
            {"Blood Glucose (mmol/L)": glucose_values},
            index=[f"D{i+1}" for i in range(7)],
        )
        st.caption("🩸 Blood Glucose (mmol/L)")
        st.bar_chart(glucose_df, use_container_width=True, height=80)

        # Oxygen Saturation (%) — 7 days
        oxygen_values = [98.0, 97.5, 98.2, 97.8, 98.1, 97.9, 98.0]
        oxygen_df = pd.DataFrame(
            {"SpO₂ (%)": oxygen_values},
            index=[f"D{i+1}" for i in range(7)],
        )
        st.caption("💨 Oxygen Saturation (SpO₂ %)")
        st.bar_chart(oxygen_df, use_container_width=True, height=80)

    # ─────────────────────────────────────────────
    # 5. Bottom navigation hint
    # ─────────────────────────────────────────────
    st.markdown("<br>", unsafe_allow_html=True)
    st.info(
        "👈 Use the sidebar to navigate to **Patient Portal**, "
        "**Kitchen Command**, or **Doc Monitor** for full details."
    )
