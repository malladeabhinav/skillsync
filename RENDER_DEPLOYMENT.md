# SkillSync Render deployment

SkillSync keeps the React frontend on GitHub Pages and runs the two Express services as Docker services on Render.

## Render services

Create two Render **Web Services** from this repository, both using Docker:

### Auth service

- Name: `skillsync-auth`
- Root directory: `backend`
- Runtime: Docker
- Dockerfile: `backend/Dockerfile`
- Health check path: `/`
- Port: `4000`

Environment variables:

- `SUPABASE_DB_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `CLIENT_ORIGIN=<GitHub Pages frontend URL>`
- `PORT=4000`

### Matching service

- Name: `skillsync-matching`
- Root directory: `server`
- Runtime: Docker
- Dockerfile: `server/Dockerfile`
- Health check path: `/`
- Port: `5000`

Environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `DATA_GOV_API_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`
- `CLIENT_ORIGIN=<GitHub Pages frontend URL>`
- `PORT=5000`
- `ADZUNA_APP_ID` (optional)
- `ADZUNA_APP_KEY` (optional)

`JWT_SECRET` must be identical in both services.

## GitHub Actions secrets

Add these repository secrets under **Settings → Secrets and variables → Actions → Secrets**:

- `RENDER_API_KEY` — Render API key used by GitHub Actions.
- `RENDER_AUTH_SERVICE_ID` — Render service ID for the auth service.
- `RENDER_MATCHING_SERVICE_ID` — Render service ID for the matching service.
- `RENDER_AUTH_URL` — public HTTPS URL of the auth service, without `/api`.
- `RENDER_MATCHING_URL` — public HTTPS URL of the matching service, without `/api`.

Do not put application secrets such as `SUPABASE_DB_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, or `DATA_GOV_API_KEY` in GitHub Actions. Put those directly in the corresponding Render service's environment settings.

## Deployment behavior

- Changes under `backend/` trigger `.github/workflows/render-auth-deploy.yml`.
- Changes under `server/` trigger `.github/workflows/render-server-deploy.yml`.
- Each workflow asks Render to deploy the current GitHub commit using the Render API.
- The workflow waits for the Render deployment to become `live`.
- It then polls the service root URL and fails if the health endpoint does not return HTTP 2xx.

The existing Docker build workflows remain useful as pull-request/build validation. Render is the persistent runtime; GitHub Actions is the deployment orchestrator.
