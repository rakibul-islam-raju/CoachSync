# Repository Guidelines

## Project Structure & Module Organization
This repository is the frontend for the Coaching Management System. Application code lives in `src/`. Route and app wiring are under `src/app/`, reusable UI lives in `src/components/`, page-level features are grouped in `src/pages/`, Redux Toolkit state and RTK Query APIs live in `src/redux/`, and shared helpers live in `src/utils/`, `src/hooks/`, and `src/constants/`. Static assets are in `public/`. Storybook stories are co-located in `src/stories/`. Build outputs go to `dist/` and `storybook-static/`; treat both as generated artifacts.

## Build, Test, and Development Commands
- `npm run dev`: start the Vite dev server.
- `npm run build`: run TypeScript checks and produce a production build in `dist/`.
- `npm test -- --run`: execute the Vitest suite once.
- `npm run lint`: run ESLint with the flat config in `eslint.config.cjs`.
- `npm run storybook`: run Storybook locally on port `6006`.
- `npm run build-storybook`: generate the static Storybook build.
- `npm run format`: run Prettier on `src/**/*.{ts,tsx,json}`.

## Coding Style & Naming Conventions
Use TypeScript with 2-space indentation and double quotes. Prefer functional React components and existing local patterns over new abstractions. Component files use `PascalCase.tsx`; hooks use `useX.ts`; Redux slices and APIs follow `featureSlice.ts` and `featureApi.ts`. Keep schema, form, and table helpers close to the page that owns them. Use ESLint and Prettier before opening a PR.

## Testing Guidelines
Tests use Vitest with Testing Library and `jsdom`. Keep test files next to the feature as `*.test.tsx`. Focus on rendering, interaction, and provider-aware integration coverage rather than snapshot-heavy tests. Run `npm test -- --run` before pushing; if you change routing, forms, or Redux state, add or update tests in the affected area.

## Commit & Pull Request Guidelines
Recent history uses short, direct subjects such as `feat: ...`, `fix: ...`, and `ref: ...`. Keep commits scoped and imperative, for example `fix: update student form validation`. PRs should include a short summary, affected screens or flows, linked issue if applicable, and screenshots for visible UI changes. Mention any follow-up work, especially bundle-size or migration-related tradeoffs.

## Configuration Notes
Runtime and build config live in `vite.config.ts`, `eslint.config.cjs`, and environment files such as `.env`. Do not commit secrets. If you change dependencies or build behavior, verify `build`, `lint`, `test`, and `build-storybook` together.
