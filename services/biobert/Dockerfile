FROM python:3.11-slim

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model at build time so container starts fast
# Remove the next two lines if you want lazy loading instead
ARG BIOBERT_MODEL=d4data/biomedical-ner-all
RUN python -c "from transformers import pipeline; pipeline('ner', model='${BIOBERT_MODEL}', aggregation_strategy='simple')" \
    || echo "Pre-download failed, will download on first request"

COPY . .

RUN useradd -m appuser && chown -R appuser /app
USER appuser

VOLUME ["/home/appuser/.cache/huggingface"]

EXPOSE 8200

HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8200/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8200", \
     "--workers", "1", "--log-level", "info"]
