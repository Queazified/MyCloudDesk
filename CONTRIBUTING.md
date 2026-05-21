# Contributing

Thanks for helping improve MyCloudDesk.

## Workflow

1. Create a feature branch from `main`.
2. Keep changes focused and small.
3. Never commit `.env` files or secrets.
4. Run the local quality checks before opening a pull request:
   - `npm run prisma:generate`
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test`
   - `npm run build`

## Local setup

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d`.
3. Apply the schema with `npm run db:push`.
4. Seed sample data with `npm run db:seed`.

## Pull requests

- Use clear titles and describe the user-facing impact.
- Include screenshots or short videos for UI changes when possible.
- Mention any schema or environment variable changes.
