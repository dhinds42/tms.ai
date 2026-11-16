# TMS.ai — Transportation Management & Freight Brokerage Platform

A Base44-hosted application (React + Vite) for motor-carrier operations, freight
brokerage, dispatch, and freight financials. Frontend lives in `src/`; backend
functions and entity definitions live in `base44/` and run on the Base44 platform.

## ⚠️ Base44 dependency & sync model

- All CRUD, auth, file storage, and function hosting go through `@base44/sdk`.
- The repo is **two-way synced with the Base44 app on `main` only**: Base44
  pushes every saved version; merged commits on `main` are pulled back into the
  app. Work on feature branches and merge via PR.
- `base44/.app.jsonc` is gitignored on purpose (per-clone app binding). Never
  commit it or hand-edit lockfiles.

### Restricted paths (managed by Base44)

- `base44/entities/**` — entity schemas are managed in the Base44 dashboard;
  the repo copy is a snapshot. Changes must be made in Base44 and allowed to
  sync — do not edit these files directly in GitHub.
- `package.json` Base44 dependencies and `package-lock.json` (bot-managed).
- No new UI/runtime libraries; the installed set is fixed.

### Freely editable

- `src/pages/**`, `src/components/**`, `src/Layout.jsx`, styling.
- Additive changes under `base44/functions/**` following existing patterns.

## Access control model

There is no row-level security at the schema level. Tenant isolation and
role-based access are enforced by entity hooks (`beforeRead`/`beforeCreate`)
through `base44/functions/shared/enforcement/tenantIsolation` (fail-closed,
`org_id` via `Membership`). **Never bypass a hook or call entities with
service-role shortcuts** — preserve this chain in every change.

## Local development

Requires Node 20+ (see `.nvmrc`). No secrets are needed (see `.env.example`).

```bash
npm install
npm run dev         # Vite dev server (frontend only)
npm run build        # production build (works without Base44 credentials)
npm run lint         # ESLint
npm run typecheck    # TypeScript check of jsconfig scope
npm test             # Jest — server-side unit tests under base44/functions/__tests__
```

`npm run dev` is normally launched from the Base44 builder, which injects the
required app parameters. The app is **buildable in GitHub but only testable
inside Base44**.

## Tests

- Server-side unit tests (math, money, settlements, RBAC, validation, finance,
  freight pricing, FSC, …) live in `base44/functions/__tests__/` (81 test
  files, pure TypeScript — no Base44 connection needed) and run via `npm test`.
- Frontend specs under `src/components/**/__tests__` require jsdom + React
  Testing Library and are not yet wired to a runner (pending decision).
- Conventions: every Base44 module is a directory with an `entry.ts`; test
  files are `<name>.test/entry.ts`; `jest-resolver.cjs` maps directory imports
  and `.js`→`.ts` imports.

## Branching & change control

- `main` is the only sync branch: PR + review required, no direct pushes.
- Schema changes must be additive; make them in Base44 and let them sync.
- Never commit credentials, tokens, or `.env` files.
- After merging to `main`, verify in the Base44 preview before publishing.
