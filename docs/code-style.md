# Code Style Guide

## TypeScript / JavaScript

- **ESLint** + **Prettier** for formatting. Run `npm run lint` before pushing.
- Prefer `const` over `let`; never `var`.
- Use `async/await` — avoid `.then()` chains.
- Explicit return types on public functions.
- No `any` types — use `unknown` and narrow.
- Named exports preferred over default exports (easier to grep).

## React / Next.js

- One component per file. File name = component name in PascalCase.
- Use React hooks for state — no class components.
- `aria-label` required on all interactive elements that lack visible text.
- Test with `@testing-library/react` — query by role, not by class.

## Rust / Soroban

- `rustfmt` with defaults — enforced by CI.
- `clippy` warnings are errors in CI.
- Public contract functions must have doc comments.
- All panics must include a message (e.g., `panic!("already initialized")`).

## SQL

- All identifiers in `snake_case`.
- SQL keywords in UPPERCASE.
- Every table must have `id UUID PRIMARY KEY`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`.
- All migrations wrapped in a transaction (`BEGIN; ... COMMIT;`).

## Git

- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Commit messages in imperative mood: "Add campaign expiry check" not "Added".
- One logical change per commit.
