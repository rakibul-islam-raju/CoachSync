# Repository Guidelines

## Project Structure & Module Organization

This repository contains a Django backend and a React/Vite frontend. In `backend/`, project configuration lives in `backend/backend/`; domain apps are `authentication/`, `user/`, `organization/`, `student/`, and `utilities/`. Migrations and tests stay within their owning apps. Templates and fixtures live in `backend/templates/` and `backend/seed_data/`.

Frontend code is under `frontend/src/`: use `pages/` for screens, `components/` for reusable UI, `redux/` for state and APIs, and `hooks/`, `utils/`, and `constants/` for shared logic. Tests are colocated as `*.test.tsx`; Storybook examples are in `src/stories/`. Treat `dist/`, `storybook-static/`, logs, media, and local databases as generated artifacts.

## Build, Test, and Development Commands

- `docker compose up -d`: start PostgreSQL, Redis, the API, and the web app.
- `cd backend && uv sync`: install the locked Python 3.14 dependencies.
- `cd backend && uv run python manage.py migrate`: apply database migrations.
- `cd backend && uv run python manage.py runserver`: run Django locally.
- `cd backend && uv run python manage.py test`: run backend tests.
- `cd frontend && pnpm install && pnpm dev`: install dependencies and start Vite.
- `cd frontend && pnpm build`: type-check and create the production bundle.
- `cd frontend && pnpm lint`: run ESLint with zero warnings allowed.
- `cd frontend && pnpm test -- --run`: run Vitest once.

## Coding Style & Naming Conventions

Python uses 4 spaces, `snake_case` functions and fields, and `PascalCase` classes. Follow Django/DRF conventions and keep serializers, views, filters, and URLs in the owning app. TypeScript uses 2 spaces, double quotes, functional components, and existing ESLint/Prettier rules. Name components `PascalCase.tsx`, hooks `useX.ts`, and Redux modules `featureSlice.ts` or `featureApi.ts`. Run `pnpm format` for frontend formatting.

## Testing Guidelines

Backend tests use Django’s runner and methods named `test_*`. Frontend tests use Vitest, Testing Library, and `jsdom`. Add focused tests for changed permissions, serializers, API behavior, forms, routing, or Redux state. No coverage threshold is configured; prioritize meaningful behavior over snapshots.

## Commit & Pull Request Guidelines

History favors concise subjects, commonly `<type>: <action>` with `feat`, `fix`, `ref`, or `docs`, for example `fix: update student filter`. Keep commits narrowly scoped. PRs should summarize the change, link relevant issues, list tests run, note migrations or configuration changes, and include screenshots for visible UI updates.

## Security & Agent Notes

Copy `backend/.env.example` and `frontend/.env.example` to local `.env` files; never commit secrets. Follow the more specific `backend/AGENTS.md` or `frontend/AGENTS.md` when working inside those directories.
