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

## Frontend build-time API URLs

The React frontend is built by GitHub Actions for GitHub Pages. Production API URLs are supplied as GitHub Actions **repository variables**:

- `RENDER_AUTH_URL` — public HTTPS origin of the Render auth service, without `/api`.
- `RENDER_MATCHING_URL` — public HTTPS origin of the Render matching service, without `/api`.

The frontend does not require production `VITE_*` repository variables. During the Vite production build, `client/vite.config.js` maps the Render variables to the browser-facing values:

```text
RENDER_AUTH_URL     → VITE_AUTH_URL
RENDER_MATCHING_URL → VITE_API_URL

VITE_AUTH_URL = RENDER_AUTH_URL without a trailing slash
VITE_API_URL  = RENDER_MATCHING_URL + /api
```

The shared Axios client uses `VITE_API_URL` as its base URL, while auth helpers append `/api/auth` to `VITE_AUTH_URL`. This keeps the Render service origins separate from the matching API path and prevents accidental `/api/api` URLs. The GitHub Pages workflow validates this resolution before running the production build.

For local development, `vite.config.js` can fall back to `VITE_AUTH_URL` and `VITE_API_URL`, with localhost defaults when those are not supplied. Production should use the `RENDER_*` repository variables supplied by GitHub Actions rather than `client/.env.production`.

## GitHub Actions variables and secrets

Add these repository **variables** under **Settings → Secrets and variables → Actions → Variables**:

- `RENDER_AUTH_URL` — public HTTPS origin of the auth service, without `/api`.
- `RENDER_MATCHING_URL` — public HTTPS origin of the matching service, without `/api`.

Add these repository **secrets** under **Settings → Secrets and variables → Actions → Secrets**:

- `RENDER_AUTH_DEPLOY_HOOK_URL` — Render deploy hook URL for the auth service.
- `RENDER_MATCHING_DEPLOY_HOOK_URL` — Render deploy hook URL for the matching service.

Do not put application secrets such as `SUPABASE_DB_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, or `DATA_GOV_API_KEY` in GitHub Actions. Put those directly in the corresponding Render service's environment settings.

## Deployment behavior

- Changes under `backend/` trigger `.github/workflows/render-auth-deploy.yml`.
- Changes under `server/` trigger `.github/workflows/render-server-deploy.yml`.
- Each backend workflow triggers the corresponding Render deploy hook and waits for the service health endpoint to return HTTP 2xx.
- Changes under `client/` or the frontend workflow trigger the GitHub Pages build.
- The GitHub Pages workflow validates `RENDER_AUTH_URL` and `RENDER_MATCHING_URL`, verifies the resulting `VITE_AUTH_URL` and `VITE_API_URL`, then builds and deploys the frontend.

The Docker build workflows remain useful as pull-request/build validation. Render is the persistent backend runtime, and GitHub Actions handles backend deployment hooks plus the GitHub Pages frontend deployment.
