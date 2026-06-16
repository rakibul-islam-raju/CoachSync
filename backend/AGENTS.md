# Repository Guidelines

## Project Structure & Module Organization

This is the Django backend for the Coaching Management System. Project settings live in `backend/`, and domain apps are split into `authentication/`, `user/`, `organization/`, `student/`, and `utilities/`. Each app keeps its models, serializers, views, URLs, admin setup, migrations, and tests near the app code. Shared templates are in `templates/`, seed fixtures are in `seed_data/`, static files are in `static/`, and uploaded development media is in `media/`.

## Build, Test, and Development Commands

Use `uv` for Python and dependency management.

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
uv run python manage.py check
uv run python manage.py test
uv run python manage.py makemigrations --check --dry-run
```

`uv sync` creates/updates `.venv` from `pyproject.toml` and `uv.lock`. `migrate` applies database migrations. `check` validates Django configuration. `test` runs Django tests. The migration check confirms model changes have matching migration files. Docker builds use `Dockerfile`, Python `3.14`, and `uv sync --frozen --no-dev`.

## Coding Style & Naming Conventions

Follow standard Django conventions: 4-space indentation, snake_case for functions and fields, PascalCase for classes, and descriptive app-level names. Keep view, serializer, filter, and URL code inside the owning app. Prefer Django/DRF APIs over custom request parsing or manual serialization. Do not edit `requirements.txt` by hand; it is exported from `uv.lock`.

## Testing Guidelines

Tests use Django’s built-in test runner. Place tests in each app’s `tests.py` or a `tests/` package when a file becomes large. Name test methods with `test_...` and cover serializers, permissions, query filtering, and API behavior for changed endpoints. Run `uv run python manage.py test` before opening a PR.

## Commit & Pull Request Guidelines

Recent commits use short messages such as `feat: added batch wise students list`, `fix: fixed student data filter issue`, and `ref: refactored dockerfile and docker-compose`. Prefer that style: `<type>: <brief action>`, with `feat`, `fix`, `ref`, or `docs`.

PRs should include a clear summary, linked issue when available, migration notes, and test results. Include screenshots or API examples when changing user-visible responses or admin/API behavior.

## Security & Configuration Tips

Keep secrets in `.env`; use `.env.example` for documented keys only. Do not commit local databases, generated logs, virtualenvs, or private media. If log files become unwritable, recreate `logs/` with the current user as owner.
