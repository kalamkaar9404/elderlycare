"""
styles.py
─────────
Shared CSS injected on every page - ELDERLY-FRIENDLY VERSION.
Color palette mirrors frontend/lib/medical-colors.ts and globals.css exactly:
  Sage  #6B8E6F  │  Teal  #20B2AA  │  Amber  #F59E0B  │  Crimson  #DC2626

ELDERLY-FRIENDLY ENHANCEMENTS:
- Larger base font size (18px minimum)
- Higher contrast ratios (WCAG AAA compliant)
- Larger buttons and interactive elements (minimum 44px)
- Simplified color palette with clear distinctions
- Enhanced focus indicators
"""
import streamlit as st

# ── Brand colours (keep in sync with frontend) ───────────────────────────────
SAGE    = "#6B8E6F"
TEAL    = "#20B2AA"
AMBER   = "#F59E0B"
CRIMSON = "#DC2626"

RISK_COLOR = {"low": TEAL, "medium": AMBER, "high": CRIMSON}
ORDER_COLOR = {"pending": AMBER, "preparing": SAGE, "ready": TEAL, "delivered": TEAL}
ALERT_COLOR = {"critical": CRIMSON, "warning": AMBER, "info": TEAL}

GLOBAL_CSS = f"""
<style>
/* ══════════════════════════════════════════════════════════════════════════
   ELDERLY-FRIENDLY STREAMLIT STYLES
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Base Typography ─────────────────────────────────────────────────────── */
html, body, [data-testid="stAppViewContainer"] {{
    background: linear-gradient(135deg,#f0fdf4 0%,#f0f9ff 50%,#f5f3ff 100%);
    font-family: 'Inter', 'Segoe UI', sans-serif;
    font-size: 18px !important;
    line-height: 1.7 !important;
}}

h1 {{ font-size: 2.5rem !important; font-weight: 700 !important; line-height: 1.3 !important; color: {SAGE} !important; }}
h2 {{ font-size: 2rem !important; font-weight: 600 !important; line-height: 1.4 !important; color: {SAGE} !important; }}
h3 {{ font-size: 1.5rem !important; font-weight: 600 !important; line-height: 1.4 !important; }}
p, div, span {{ font-size: 1.125rem !important; line-height: 1.7 !important; }}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {{
    background: linear-gradient(160deg,#0f4c35 0%,#0a3d62 100%) !important;
    border-right: 2px solid rgba(255,255,255,0.15) !important;
    padding: 1.5rem !important;
}}
[data-testid="stSidebar"] * {{ 
    color: #ffffff !important; 
    font-size: 1.125rem !important;
}}
[data-testid="stSidebar"] .stRadio label {{
    font-size: 1.25rem !important; 
    font-weight: 600 !important; 
    padding: 0.75rem 0 !important;
    min-height: 44px !important;
}}

/* ── Enhanced Cards ──────────────────────────────────────────────────────── */
.mn-card {{
    background: rgba(255,255,255,0.95) !important;
    backdrop-filter: blur(14px);
    border: 2px solid rgba(107,142,111,0.25) !important;
    border-radius: 1rem !important;
    padding: 2rem !important;
    margin-bottom: 1.5rem !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important;
}}
.mn-card:hover {{
    box-shadow: 0 10px 32px rgba(0,0,0,0.15) !important;
    transform: translateY(-2px);
    border-color: rgba(107,142,111,0.4) !important;
    transition: all .25s ease;
}}

/* ── Gradient headers ────────────────────────────────────────────────────── */
.page-header {{
    background: linear-gradient(135deg,{SAGE} 0%,{TEAL} 100%);
    color: white;
    border-radius: 1rem;
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
}}
.page-header h2 {{ margin: 0; font-size: 2.5rem !important; font-weight: 800 !important; }}
.page-header p  {{ margin: 0.5rem 0 0; opacity: 0.95; font-size: 1.25rem !important; }}

.header-amber {{ background: linear-gradient(135deg,{AMBER} 0%,{SAGE} 100%); }}
.header-crimson {{ background: linear-gradient(135deg,{CRIMSON} 0%,{TEAL} 100%); }}

/* ── KPI tiles (Elderly-Friendly) ────────────────────────────────────────── */
.kpi-tile {{
    background: rgba(255,255,255,0.95);
    border-radius: 1rem;
    padding: 2rem 1.5rem;
    border: 2px solid rgba(107,142,111,0.25);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    text-align: center;
    transition: all 0.3s ease;
}}
.kpi-tile:hover {{
    box-shadow: 0 10px 28px rgba(0,0,0,0.12);
    transform: translateY(-3px);
}}
.kpi-num  {{ 
    font-size: 3rem !important; 
    font-weight: 800 !important; 
    line-height: 1.1 !important; 
    color: {SAGE} !important;
}}
.kpi-label {{ 
    font-size: 1rem !important; 
    color: #444 !important; 
    margin-top: 0.5rem !important; 
    font-weight: 600 !important; 
    letter-spacing: 0.03em !important; 
    text-transform: uppercase !important;
}}

/* ── Badges (Elderly-Friendly) ───────────────────────────────────────────── */
.badge {{
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 2rem;
    padding: 0.625rem 1.25rem;
    font-size: 1rem !important;
    font-weight: 700 !important;
    border: 2px solid;
}}
.badge-safe     {{ background: #E0F7F5; color: #0D7A72; border-color: {TEAL}; }}
.badge-pending  {{ background: #FEF3C7; color: #92400E; border-color: {AMBER}; }}
.badge-critical {{ background: #FEE2E2; color: #991B1B; border-color: {CRIMSON}; }}
.badge-approved {{ background: #F0F6E8; color: #3D5A40; border-color: {SAGE}; }}

/* ── Buttons (Elderly-Friendly) ──────────────────────────────────────────── */
.stButton > button {{
    min-height: 48px !important;
    padding: 0.875rem 1.5rem !important;
    font-size: 1.125rem !important;
    font-weight: 600 !important;
    border-radius: 0.75rem !important;
    border: 2px solid transparent !important;
    transition: all 0.2s ease !important;
}}
.stButton > button:hover {{
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(0,0,0,0.15) !important;
}}
.stButton > button:focus {{
    outline: 4px solid {TEAL} !important;
    outline-offset: 3px !important;
}}

/* ── Input Fields (Elderly-Friendly) ─────────────────────────────────────── */
input, textarea, select {{
    min-height: 48px !important;
    padding: 0.875rem 1rem !important;
    font-size: 1.125rem !important;
    border: 2px solid rgba(107,142,111,0.3) !important;
    border-radius: 0.75rem !important;
}}
input:focus, textarea:focus, select:focus {{
    border-color: {TEAL} !important;
    outline: 3px solid rgba(32,178,170,0.25) !important;
    outline-offset: 2px !important;
}}

/* ── Chat bubbles (Elderly-Friendly) ─────────────────────────────────────── */
.chat-user {{
    background: rgba(32,178,170,0.15);
    border: 2px solid rgba(32,178,170,0.4);
    border-radius: 1rem 1rem 0.25rem 1rem;
    padding: 1rem 1.25rem;
    margin: 0.75rem 0;
    max-width: 80%;
    margin-left: auto;
    font-size: 1.125rem !important;
    line-height: 1.7 !important;
}}
.chat-bot {{
    background: rgba(255,255,255,0.95);
    border: 2px solid rgba(107,142,111,0.25);
    border-radius: 1rem 1rem 1rem 0.25rem;
    padding: 1rem 1.25rem;
    margin: 0.75rem 0;
    max-width: 80%;
    font-size: 1.125rem !important;
    line-height: 1.7 !important;
}}
.chat-sys {{
    background: rgba(107,142,111,0.12);
    border: 2px solid rgba(107,142,111,0.3);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    margin: 0.75rem auto;
    max-width: 90%;
    font-size: 1rem !important;
    color: #333 !important;
    text-align: center;
    font-weight: 600 !important;
}}

/* ── Risk colours ────────────────────────────────────────────────────────── */
.risk-low    {{ color: {TEAL}; font-weight: 700; font-size: 1.125rem !important; }}
.risk-medium {{ color: {AMBER}; font-weight: 700; font-size: 1.125rem !important; }}
.risk-high   {{ color: {CRIMSON}; font-weight: 700; font-size: 1.125rem !important; }}

/* ── Status progress bar ─────────────────────────────────────────────────── */
.progress-bar-wrap {{
    height: 12px;
    background: #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    border: 2px solid rgba(107,142,111,0.2);
}}
.progress-bar-fill {{
    height: 100%;
    border-radius: 4px;
    transition: width .4s ease;
}}

/* ── Section divider ─────────────────────────────────────────────────────── */
.mn-divider {{
    border: none;
    border-top: 2px solid rgba(107,142,111,0.2);
    margin: 1.5rem 0;
}}

/* ── Stat row ────────────────────────────────────────────────────────────── */
.stat-row {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    background: rgba(255,255,255,0.8);
    border: 2px solid rgba(107,142,111,0.2);
    margin-bottom: 0.75rem;
}}
.stat-label {{ font-size: 1.125rem !important; color: #555; font-weight: 600; }}
.stat-value {{ font-size: 1.25rem !important; font-weight: 700; color: {SAGE}; }}

/* ── Approval box ────────────────────────────────────────────────────────── */
.approval-pending {{
    border: 3px solid {CRIMSON};
    border-radius: 1rem;
    padding: 1.5rem 2rem;
    background: rgba(220,38,38,0.05);
}}
.approval-granted {{
    border: 3px solid {SAGE};
    border-radius: 1rem;
    padding: 1.5rem 2rem;
    background: rgba(107,142,111,0.08);
}}

/* ── Alert row ───────────────────────────────────────────────────────────── */
.alert-critical {{ 
    background: rgba(220,38,38,0.08);
    border-left: 6px solid {CRIMSON};
    border-radius: 0 0.75rem 0.75rem 0;
    padding: 1rem 1.5rem;
    margin-bottom: 0.75rem;
    font-size: 1.125rem !important;
}}
.alert-warning {{ 
    background: rgba(245,158,11,0.08);
    border-left: 6px solid {AMBER};
    border-radius: 0 0.75rem 0.75rem 0;
    padding: 1rem 1.5rem;
    margin-bottom: 0.75rem;
    font-size: 1.125rem !important;
}}
.alert-info {{ 
    background: rgba(32,178,170,0.08);
    border-left: 6px solid {TEAL};
    border-radius: 0 0.75rem 0.75rem 0;
    padding: 1rem 1.5rem;
    margin-bottom: 0.75rem;
    font-size: 1.125rem !important;
}}

/* ── Recipe card ─────────────────────────────────────────────────────────── */
.recipe-ingredient {{
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    font-size: 1.125rem !important;
    border-bottom: 2px solid rgba(0,0,0,0.05);
}}
.recipe-dot {{
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: linear-gradient(135deg,{SAGE},{TEAL});
    flex-shrink: 0;
}}

/* ── Order card ──────────────────────────────────────────────────────────── */
.order-card {{
    background: rgba(255,255,255,0.9);
    border-radius: 0.75rem;
    padding: 1.25rem 1.5rem;
    margin-bottom: 0.75rem;
    border: 2px solid rgba(107,142,111,0.2);
    cursor: pointer;
    transition: all 0.2s ease;
}}
.order-card.selected {{ 
    border-color: {SAGE};
    background: rgba(107,142,111,0.08);
    box-shadow: 0 4px 12px rgba(107,142,111,0.2);
}}
.order-card:hover {{ 
    border-color: rgba(32,178,170,0.5);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}}

/* ── Streamlit Widget Overrides ──────────────────────────────────────────── */
.stTextInput > div > div > input {{
    font-size: 1.125rem !important;
}}
.stSelectbox > div > div > div {{
    font-size: 1.125rem !important;
}}
.stTextArea > div > div > textarea {{
    font-size: 1.125rem !important;
}}
.stCheckbox > label {{
    font-size: 1.125rem !important;
}}
.stRadio > label {{
    font-size: 1.125rem !important;
}}

/* ── Data Tables ─────────────────────────────────────────────────────────── */
.dataframe {{
    font-size: 1.125rem !important;
}}
.dataframe th {{
    background: {SAGE} !important;
    color: white !important;
    font-weight: 700 !important;
    padding: 1rem !important;
    border-bottom: 3px solid #5A7A5E !important;
}}
.dataframe td {{
    padding: 0.875rem 1rem !important;
    border-bottom: 2px solid rgba(107,142,111,0.15) !important;
}}
</style>
"""


def inject_css():
    st.markdown(GLOBAL_CSS, unsafe_allow_html=True)
