# AgroAlerta AI — frontend + FastAPI + ConvNeXt in one image
FROM node:20-bookworm-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --no-fund --no-audit
COPY frontend/ ./
# Same-origin API when served by FastAPI
ENV VITE_API_URL=
RUN npm run build

FROM python:3.11-slim-bookworm AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    STATIC_DIR=/app/frontend_dist \
    APP_ENV=production \
    DEBUG=false \
    AUTO_LOAD_MODEL=true \
    HOST=0.0.0.0 \
    PORT=8000 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    CORS_ORIGINS=*

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# CPU torch wheels (smaller than CUDA)
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip \
 && pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1 torchvision==0.20.1 \
 && pip install -r /tmp/requirements.txt \
 && pip uninstall -y pytest pytest-asyncio || true

COPY backend/ /app/
COPY --from=frontend-build /frontend/dist /app/frontend_dist

RUN mkdir -p /app/data /app/uploads \
 && chmod -R a+rwX /app/data /app/uploads

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=5)"

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
