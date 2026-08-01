FROM python:3.14-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.21 /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

FROM python:3.14-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

RUN addgroup --system app \
    && adduser --system --ingroup app app

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY --chown=app:app . .
RUN mkdir -p /app/staticfiles /app/media \
    && chown -R app:app /app/staticfiles /app/media \
    && chmod +x scripts/*.sh

USER app
EXPOSE 8000
CMD ["./scripts/start.sh"]
