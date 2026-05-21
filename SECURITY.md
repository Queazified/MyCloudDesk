# Security Policy

## Reporting a vulnerability

Please report security issues privately to Queazified before disclosing them publicly.

Include:

- A description of the issue
- Impacted routes or features
- Reproduction steps
- Suggested mitigations if known

## Security notes

- Do not commit `.env` files or production secrets.
- Rotate `NEXTAUTH_SECRET` before production deployment.
- Use HTTPS for all deployed environments.
- Restrict remote desktop URLs to trusted providers only.
- Review admin role mappings before inviting new users.
