# Contributing to Pulse Rewards

Thank you for your interest in contributing! This guide will get you from zero to a merged PR.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting started](#getting-started)
3. [Development workflow](#development-workflow)
4. [Commit conventions](#commit-conventions)
5. [Pull request process](#pull-request-process)
6. [Testing requirements](#testing-requirements)
7. [Code style](#code-style)
8. [Reporting bugs](#reporting-bugs)

---

## Code of Conduct

This project follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).  
By participating you agree to uphold these standards. Report violations to conduct@pulse-rewards.io.

---

## Getting started

1. **Fork** the repo on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/pulse-rewards.git
   cd pulse-rewards
   ```
3. **Set up the dev environment** following the [Quick Start](README.md#quick-start).
4. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

Branch naming:

| Prefix | Use for |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code changes that don't fix a bug or add a feature |
| `test/` | Adding or fixing tests |
| `chore/` | Build scripts, CI, dependency updates |

---

## Development workflow

### Before every push

```bash
# JavaScript / TypeScript
cd pulseRewards
npm run lint        # ESLint
npm run type-check  # TypeScript
npm run test        # Jest

# Rust / Soroban
cargo fmt --all
cargo clippy -- -D warnings
cargo test
```

All checks run in CI — a failed check blocks merge.

### Running the local stack

```bash
docker compose up --build
```

See [README.md](README.md#3----start-the-full-stack) for service URLs and useful compose commands.

---

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

Examples:

```
feat(contracts): add campaign expiry enforcement
fix(api): handle missing Stellar account on reward claim
docs(stellar): add Freighter error reference table
chore(ci): pin Node.js to 20.14.0
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.

---

## Pull request process

1. Open the PR against `main`.
2. Fill in the PR template (summary, testing, screenshots if UI).
3. Link the related issue with `Closes #<issue>`.
4. Wait for CI to go green — fix failures before requesting review.
5. Two maintainer approvals required.
6. PRs are **squash-merged** — your commit messages become the squash message.

---

## Testing requirements

| Area | Minimum |
|------|---------|
| New API endpoints | Unit + integration test |
| New Soroban contract functions | Rust unit test |
| Bug fixes | Regression test |
| UI components | Component test (Jest + React Testing Library) |

Run the full suite:

```bash
cd pulseRewards && npm test
cargo test --workspace
```

---

## Code style

- **TypeScript**: ESLint config at `pulseRewards/.eslintrc.js`. Prettier config at `.prettierrc`.
- **Rust**: `rustfmt` with default settings. Clippy warnings are errors in CI.
- **SQL**: snake_case identifiers, all keywords uppercase.
- See [docs/code-style.md](docs/code-style.md) for detailed guidelines.

---

## Reporting bugs

1. Search [existing issues](https://github.com/unixfundz/pulse-rewards/issues) first.
2. If it's a **security vulnerability**, see [SECURITY.md](SECURITY.md) — do not file a public issue.
3. Otherwise, open a [Bug Report](https://github.com/unixfundz/pulse-rewards/issues/new?template=bug_report.md) and include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Node version, browser)
   - Logs / screenshots

---

## Questions?

Open a [GitHub Discussion](https://github.com/unixfundz/pulse-rewards/discussions) — the maintainers check discussions daily.
