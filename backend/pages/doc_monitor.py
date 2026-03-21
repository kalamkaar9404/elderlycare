import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from data.mock_data import PATIENTS, VITALS_HISTORY, ALERTS, PENDING_PLANS
from utils.styles import inject_css, SAGE, TEAL, AMBER, CRIMSON


def render():
    inject_css()

    # ── Session state initialisation ────────────────────────────────────────────
    if "doc_selected_patient_id" not in st.session_state:
        st.session_state["doc_selected_patient_id"] = str(PATIENTS[0]["id"])
    if "doc_approved_plan_ids" not in st.session_state:
        st.session_state["doc_approved_plan_ids"] = []

    selected_id = st.session_state["doc_selected_patient_id"]

    # ── Helpers ──────────────────────────────────────────────────────────────────
    def _risk_color(level: str) -> str:
        level = (level or "").lower()
        if level == "high":
            return CRIMSON
        if level == "medium":
            return AMBER
        return TEAL

    def _risk_icon(level: str) -> str:
        level = (level or "").lower()
        if level == "high":
            return "🔴"
        if level == "medium":
            return "🟡"
        return "🟢"

    # ── Counts used in multiple places ───────────────────────────────────────────
    unresolved_for_selected = [
        a for a in ALERTS
        if str(a.get("patient_id")) == selected_id and not a.get("resolved", False)
    ]
    unresolved_count = len(unresolved_for_selected)

    all_unresolved = [a for a in ALERTS if not a.get("resolved", False)]
    all_unresolved_count = len(all_unresolved)

    pending_not_approved = [
        p for p in PENDING_PLANS
        if p["id"] not in st.session_state["doc_approved_plan_ids"]
    ]

    # ── Page header ───────────────────────────────────────────────────────────────
    alert_notice = (
        f"⚠️ {unresolved_count} unresolved alert{'s' if unresolved_count != 1 else ''} for selected patient · "
        if unresolved_count
        else ""
    )
    st.markdown(
        f"""
        <div class="page-header header-crimson">
            <h1>🩺 Doctor Monitor</h1>
            <p class="subtitle">
                {alert_notice}Review patient status · Approve meal plans · Manage alerts
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # ── Top KPI bar ───────────────────────────────────────────────────────────────
    critical_count = sum(
        1 for a in all_unresolved if (a.get("type") or a.get("severity") or "").lower() == "critical"
    )
    warning_count = sum(
        1 for a in all_unresolved if (a.get("type") or a.get("severity") or "").lower() == "warning"
    )

    kpi1, kpi2, kpi3 = st.columns(3)
    with kpi1:
        st.markdown(
            f"""
            <div class="kpi-tile">
                <div class="kpi-value">{len(PATIENTS)}</div>
                <div class="kpi-label">Total Patients</div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with kpi2:
        st.markdown(
            f"""
            <div class="kpi-tile">
                <div class="kpi-value" style="color:{CRIMSON};">{all_unresolved_count}</div>
                <div class="kpi-label">Active Alerts
                    <span style="font-size:0.75rem; color:{CRIMSON};">
                        ({critical_count} critical, {warning_count} warning)
                    </span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with kpi3:
        st.markdown(
            f"""
            <div class="kpi-tile">
                <div class="kpi-value" style="color:{AMBER};">{len(PENDING_PLANS)}</div>
                <div class="kpi-label">Pending Approvals</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Main layout ───────────────────────────────────────────────────────────────
    patient_col, detail_col = st.columns([1, 3], gap="medium")

    # ════════════════════════════════════════════════════════════════════════════
    # PATIENT LIST COLUMN
    # ════════════════════════════════════════════════════════════════════════════
    with patient_col:
        st.markdown("### 👥 High-Risk Patients")
        for patient in PATIENTS:
            pid = str(patient["id"])
            risk_level = patient.get("risk_level", "low")
            risk_col = _risk_color(risk_level)
            icon = _risk_icon(risk_level)
            name = patient.get("name", "Unknown")
            pregnancy_week = patient.get("pregnancy_week", "?")
            label = f"{icon} {name}\nWk {pregnancy_week} · {risk_level.capitalize()}"
            is_selected = pid == selected_id

            btn_type = "primary" if is_selected else "secondary"
            if st.button(
                label,
                key=f"pat_{pid}",
                use_container_width=True,
                type=btn_type,
            ):
                st.session_state["doc_selected_patient_id"] = pid
                st.rerun()

            st.markdown(
                f"<small style='color:{risk_col}; padding-left:4px;'>"
                f"{risk_level.upper()} RISK</small>",
                unsafe_allow_html=True,
            )

    # ════════════════════════════════════════════════════════════════════════════
    # DETAIL COLUMN
    # ════════════════════════════════════════════════════════════════════════════
    with detail_col:

        # Look up selected patient
        selected_patient = next(
            (p for p in PATIENTS if str(p["id"]) == selected_id), PATIENTS[0]
        )
        risk_level = selected_patient.get("risk_level", "low")
        risk_col = _risk_color(risk_level)
        pregnancy_week = selected_patient.get("pregnancy_week", "?")
        age = selected_patient.get("age", "?")
        name = selected_patient.get("name", "Unknown")
        status = selected_patient.get("status", "Active")

        # ── 6b  Patient info card ────────────────────────────────────────────────
        st.markdown(
            f"""
            <div class="mn-card" style="margin-bottom:1.25rem;">
                <h2 style="margin:0 0 0.75rem 0; font-size:1.5rem;">{name}</h2>
                <div style="display:flex; gap:2rem; flex-wrap:wrap;">
                    <div class="stat-block">
                        <span class="stat-label">Pregnancy Week</span>
                        <span class="stat-value">{pregnancy_week} / 40</span>
                    </div>
                    <div class="stat-block">
                        <span class="stat-label">Age</span>
                        <span class="stat-value">{age}</span>
                    </div>
                    <div class="stat-block">
                        <span class="stat-label">Risk Level</span>
                        <span class="stat-value" style="color:{risk_col}; font-weight:700;">
                            {risk_level.upper()}
                        </span>
                    </div>
                </div>
                <div style="margin-top:0.75rem;">
                    <span class="status-badge">{status}</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # ── 6c  Medical charts ───────────────────────────────────────────────────
        try:
            vitals_df = pd.DataFrame(VITALS_HISTORY)

            # Chart 1 — Blood Glucose Trend
            fig1 = go.Figure()
            fig1.add_trace(
                go.Scatter(
                    x=vitals_df["day"],
                    y=vitals_df["glucose"],
                    mode="lines",
                    name="Glucose (mmol/L)",
                    fill="tozeroy",
                    line=dict(color=SAGE, width=2),
                    fillcolor=f"rgba({_hex_to_rgb(SAGE)}, 0.18)",
                )
            )
            # Reference lines
            ref_lines_glucose = [
                (4,  TEAL,   "Safe Min",   "dash"),
                (7,  TEAL,   "Safe Max",   "dash"),
                (9,  AMBER,  "Attention",  "dash"),
                (11, CRIMSON,"Critical",   "dash"),
            ]
            for y_val, color, label_text, dash_style in ref_lines_glucose:
                fig1.add_hline(
                    y=y_val,
                    line=dict(color=color, dash=dash_style, width=1.5),
                    annotation_text=label_text,
                    annotation_position="right",
                    annotation_font=dict(color=color, size=11),
                )
            fig1.update_layout(
                title=dict(text="Blood Glucose Trend (30 days)", font=dict(size=15)),
                xaxis_title="Day",
                yaxis_title="mmol/L",
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                margin=dict(l=0, r=60, t=45, b=30),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                height=280,
            )
            st.plotly_chart(fig1, use_container_width=True)

            # Chart 2 — Blood Pressure Trend
            fig2 = go.Figure()
            fig2.add_trace(
                go.Scatter(
                    x=vitals_df["day"],
                    y=vitals_df["systolic"],
                    mode="lines+markers",
                    name="Systolic",
                    line=dict(color=SAGE, width=2),
                    marker=dict(size=4),
                )
            )
            fig2.add_trace(
                go.Scatter(
                    x=vitals_df["day"],
                    y=vitals_df["diastolic"],
                    mode="lines+markers",
                    name="Diastolic",
                    line=dict(color=TEAL, width=2),
                    marker=dict(size=4),
                )
            )
            ref_lines_bp = [
                (120, TEAL,  "Normal", "dash"),
                (140, AMBER, "High",   "dash"),
            ]
            for y_val, color, label_text, dash_style in ref_lines_bp:
                fig2.add_hline(
                    y=y_val,
                    line=dict(color=color, dash=dash_style, width=1.5),
                    annotation_text=label_text,
                    annotation_position="right",
                    annotation_font=dict(color=color, size=11),
                )
            fig2.update_layout(
                title=dict(text="Blood Pressure Trend (30 days)", font=dict(size=15)),
                xaxis_title="Day",
                yaxis_title="mmHg",
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                margin=dict(l=0, r=60, t=45, b=30),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                height=280,
            )
            st.plotly_chart(fig2, use_container_width=True)

        except Exception as e:
            st.warning(f"⚠️ Could not render vitals charts: {e}")

        # ── 6d  Alerts + Approval queue ──────────────────────────────────────────
        alert_col, approval_col = st.columns(2)

        # ── ALERT PANEL ─────────────────────────────────────────────────────────
        with alert_col:
            patient_alerts = [
                a for a in ALERTS
                if str(a.get("patient_id")) == selected_id and not a.get("resolved", False)
            ]
            alert_count = len(patient_alerts)
            st.markdown(
                f"### 🚨 Active Alerts "
                f"<span style='font-size:0.9rem; color:{CRIMSON};'>({alert_count} active)</span>",
                unsafe_allow_html=True,
            )

            if not patient_alerts:
                st.success("✅ No active alerts for this patient")
            else:
                for alert in patient_alerts:
                    try:
                        severity = (
                            alert.get("severity") or alert.get("type") or "info"
                        ).lower()
                        if severity == "critical":
                            card_class = "alert-critical"
                            label_color = CRIMSON
                            label_text = "🔴 CRITICAL"
                        elif severity == "warning":
                            card_class = "alert-warning"
                            label_color = AMBER
                            label_text = "🟡 WARNING"
                        else:
                            card_class = "alert-info"
                            label_color = TEAL
                            label_text = "🔵 INFO"

                        message = alert.get("message", "")
                        try:
                            ts = alert.get("timestamp")
                            time_str = ts.strftime("%H:%M") if ts else ""
                        except Exception:
                            time_str = str(alert.get("timestamp", ""))

                        st.markdown(
                            f"""
                            <div class="mn-card {card_class}"
                                 style="margin-bottom:0.6rem; padding:0.75rem 1rem;">
                                <strong style="color:{label_color};">{label_text}</strong>
                                <p style="margin:0.3rem 0 0.15rem 0; font-size:0.9rem;">{message}</p>
                                <small style="color:#888;">{time_str}</small>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )
                    except Exception as e:
                        st.warning(f"Could not render alert: {e}")

        # ── APPROVAL QUEUE ───────────────────────────────────────────────────────
        with approval_col:
            st.markdown("### 📋 Approval Queue")

            pending_not_approved = [
                p for p in PENDING_PLANS
                if p["id"] not in st.session_state["doc_approved_plan_ids"]
            ]
            approved_count = len(PENDING_PLANS) - len(pending_not_approved)

            if not pending_not_approved:
                pass  # handled below after approved count section
            else:
                for plan in pending_not_approved:
                    try:
                        patient_name = plan.get("patient_name", "Unknown Patient")
                        meal_count = plan.get("meal_count", "?")
                        total_calories = plan.get("total_calories", "?")
                        try:
                            gen_at = plan.get("generated_at")
                            gen_str = gen_at.strftime("%I:%M %p") if gen_at else ""
                        except Exception:
                            gen_str = str(plan.get("generated_at", ""))

                        st.markdown(
                            f"""
                            <div class="mn-card" style="margin-bottom:0.5rem; padding:0.75rem 1rem;">
                                <strong style="font-size:1rem;">{patient_name}</strong>
                                <p style="margin:0.3rem 0 0.15rem 0; font-size:0.88rem;">
                                    🍽️ {meal_count} meals &nbsp;&nbsp; ⚡ {total_calories} kcal
                                </p>
                                <small style="color:#888;">{gen_str}</small>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )

                        btn_approve_col, btn_modify_col = st.columns(2)
                        with btn_approve_col:
                            if st.button(
                                "✅ Approve",
                                key=f"approve_{plan['id']}",
                                type="primary",
                                use_container_width=True,
                            ):
                                st.session_state["doc_approved_plan_ids"].append(plan["id"])
                                st.rerun()
                        with btn_modify_col:
                            if st.button(
                                "✏️ Modify",
                                key=f"modify_{plan['id']}",
                                use_container_width=True,
                            ):
                                st.info(f"Opening plan editor for {patient_name}...")

                    except Exception as e:
                        st.warning(f"Could not render plan: {e}")

            # Approved plans summary
            if approved_count > 0:
                st.markdown(
                    f"""
                    <div style="margin-top:0.75rem; padding:0.6rem 1rem;
                                background:rgba(90,188,160,0.12);
                                border-left:4px solid {TEAL};
                                border-radius:6px; font-size:0.9rem; color:{TEAL};">
                        ✅ <strong>{approved_count}</strong>
                        plan{'s' if approved_count != 1 else ''} approved this session
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            # All plans approved?
            if len(pending_not_approved) == 0 and len(PENDING_PLANS) > 0:
                st.balloons()
                st.success("🎉 All plans approved!")


# ── Internal utility ──────────────────────────────────────────────────────────
def _hex_to_rgb(hex_color: str) -> str:
    """Convert #RRGGBB to 'R,G,B' string for rgba() CSS."""
    try:
        h = hex_color.lstrip("#")
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        return f"{r},{g},{b}"
    except Exception:
        return "128,128,128"
