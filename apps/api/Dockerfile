# Ayekta API — Google Cloud Run (listens on $PORT, default 8080)
FROM python:3.11-slim-bookworm

WORKDIR /app

# asyncpg wheels are usually prebuilt; if build fails on your platform, add: gcc libpq-dev
COPY pyproject.toml README.md ./
COPY ayekta_api ./ayekta_api

RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir .

# Uncomment for S3-compatible attachment presign (AWS S3, MinIO, R2, etc.):
# RUN pip install --no-cache-dir 'boto3>=1.34.0'

ENV PYTHONUNBUFFERED=1
ENV PORT=8080

EXPOSE 8080

# Cloud Run sets PORT; keep 8080 as local default
CMD ["sh", "-c", "exec uvicorn ayekta_api.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
