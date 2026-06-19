# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | ✅ Active |
| Previous releases | ⚠️ Critical fixes only |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities via one of these private channels:

1. **GitHub Private Security Advisory** (preferred):  
   [https://github.com/unixfundz/pulse-rewards/security/advisories/new](https://github.com/unixfundz/pulse-rewards/security/advisories/new)

2. **Email**: security@pulse-rewards.io  
   Encrypt sensitive details with our [PGP key](docs/security/pgp-public-key.asc).

### What to include

- Description of the vulnerability and affected component
- Steps to reproduce (or proof-of-concept)
- Potential impact / CVSS score estimate
- Suggested fix (optional)

### Response timeline

| Action | SLA |
|--------|-----|
| Acknowledgement | 48 hours |
| Initial assessment | 5 business days |
| Fix / patch released | 30 days (critical), 90 days (others) |
| CVE assignment (if applicable) | After patch release |

We follow [coordinated disclosure](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html). Please allow us to release a fix before public disclosure.

---

## Scope

### In scope

- `pulseRewards/backend/` — API authentication, authorization, input validation
- `pulseRewards/frontend/` — XSS, CSRF, client-side secrets exposure
- `contracts/` — Soroban contract logic, overflow, reentrancy
- Infrastructure misconfigurations (exposed secrets, open S3 buckets, etc.)

### Out of scope

- Denial-of-service against third-party services (Stellar Horizon, etc.)
- Rate-limit bypass on testnet endpoints
- Social engineering of team members
- Issues requiring physical access

---

## Security Design

See [docs/security/README.md](docs/security/README.md) for the full security overview, including:

- Authentication & authorization model
- Secrets management approach
- Threat model summary
- Dependency scanning policy
