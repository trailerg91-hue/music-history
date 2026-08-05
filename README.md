# History of Music

Monorepo with a Vite/React frontend and an Express/MongoDB backend.

## Structure

```text
frontend/   React + Vite app (Vercel)
backend/    Express API (Render)
```

## Setup

```bash
npm run install:all
```

Copy env files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## Development

```bash
# frontend (http://localhost:5173)
npm run dev

# backend (http://localhost:5000)
npm run dev:backend
```

## Production scripts

```bash
npm run build          # build frontend
npm start              # start backend
```

## Deploy notes

- **Vercel**: set Root Directory to `frontend`
- **Render**: service Root Directory is `backend` (see `render.yaml`)

### Backend cold starts (Render free tier)

Render sleeps idle free services. This repo mitigates that with:

1. Early `/api/health` wake from `frontend/index.html` + `wakeBackend()` in the SPA
2. API retries while the service boots
3. GitHub Action `.github/workflows/keep-backend-warm.yml` (cron every 10 minutes)

For a permanent fix, upgrade Render to a paid always-on plan.
