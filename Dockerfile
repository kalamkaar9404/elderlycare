# ════════════════════════════════════════════════════════════════════════════
#  Dr. NutriCare — Backend Dockerfile
#  Runs the Streamlit dashboard (port 8501) for NGO staff.
#  Deploy to: Render.com (free tier), Railway, or any Docker host.
#
#  The BioBERT and MedGemma microservices have their own Dockerfiles in:
#    services/biobert/Dockerfile   → deploy separately, port 8200
#    services/medgemma/Dockerfile  → deploy separately, port 8100
# ════════════════════════════════════════════════════════════════════════════
FROM python:3.11-slim

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install Python deps ───────────────────────────────────────────────────────
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy app code ─────────────────────────────────────────────────────────────
COPY backend/ ./backend/
COPY app.py    ./

# ── Non-root user ─────────────────────────────────────────────────────────────
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8501

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8501/_stcore/health || exit 1

CMD ["streamlit", "run", "app.py", \
     "--server.port=8501", \
     "--server.address=0.0.0.0", \
     "--server.headless=true", \
     "--browser.gatherUsageStats=false"]
