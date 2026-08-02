# CoachSync Coaching Management System

CoachSync is a Django REST Framework and React/Vite application for managing
organizations, employees, academic catalogs, students, enrollments, manual
payments, invoices, scholarships, expenses, cash reconciliation, exams, and
schedules.

Finance is intentionally payment-gateway-free. Staff record payments received
through offline methods such as cash, bank transfer, or mobile banking. See
[FINANCE.md](FINANCE.md) for the finance workflow, accounting rules, API, and
migration notes.

## Run with Docker

Requirements: Docker Engine with the Compose plugin.

```bash
cp .env.example .env
# Replace POSTGRES_PASSWORD and SECRET_KEY in .env.
docker compose up --build -d
docker compose ps
```

The production-shaped Compose stack uses PostgreSQL, Redis, Gunicorn, Celery,
and an Nginx-served frontend. It does not seed default credentials.

- Frontend: <http://localhost:5173>
- API documentation: <http://localhost:8000>
- ReDoc: <http://localhost:8000/redoc/>
- API liveness: <http://localhost:8000/health/live>
- API readiness: <http://localhost:8000/health/ready>

Create the first administrator explicitly:

```bash
docker compose exec api python manage.py createsuperuser
```

## Local development

Backend requirements are Python 3.14 and `uv`:

```bash
cp backend/.env.example backend/.env
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
```

The backend example defaults to SQLite for deliberate local development. Set
`DATABASE_ENGINE=postgresql` and the `PG_*` variables, or set `DATABASE_URL`, to
develop against PostgreSQL.

Frontend requirements are Node.js 24 and pnpm 10.26.2:

```bash
cp frontend/.env.example frontend/.env
cd frontend
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## Verification

```bash
cd backend
uv run python manage.py check
uv run python manage.py makemigrations --check --dry-run
uv run python manage.py test
uv run python manage.py spectacular --file /tmp/openapi.yaml --validate

cd ../frontend
pnpm format:check
pnpm lint
pnpm test:run
pnpm build
pnpm build-storybook
```

CI runs these checks against PostgreSQL and Redis, then builds both production
container images. Version tags publish API and web images to GitHub Container
Registry.

## Operations

Deployment, security, migration, health-check, backup, restore, and rollback
instructions are in [DEPLOYMENT.md](DEPLOYMENT.md). The organization-tenancy
migration history and current capability status are documented in
[FEATURE_AUDIT.md](FEATURE_AUDIT.md).

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) and the repository `AGENTS.md`
files for project conventions.
