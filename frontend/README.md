# CoachSync frontend

The frontend uses React, TypeScript, Vite, Redux Toolkit, Material UI, Vitest,
Testing Library, and Storybook. pnpm is the only supported package manager.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Set `VITE_BASE_API_URL` and `VITE_BASE_URL` in `.env`; see `.env.example`.

Verification commands:

```bash
pnpm format:check
pnpm lint
pnpm test:run
pnpm build
pnpm build-storybook
```

`storybook-static/` and `dist/` are generated artifacts and must not be
committed. The production Docker image compiles the app with pnpm and serves the
result through Nginx with SPA routing and immutable asset caching.
