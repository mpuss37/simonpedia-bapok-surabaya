# SIMONPEDIA Bapok Surabaya

A web application for monitoring staple food (*bahan pokok* / "bapok") prices in
Surabaya, Indonesia. It provides price monitoring, an Early Warning System,
price forecasting, action recommendations, and an admin panel for managing data.

Built by **Tim EWS**.

## Features

- **Dashboard** — price summary and trends
- **Price Monitoring** — per-commodity tracking
- **Markets & Map** — list of markets and an interactive map
- **Early Warning System (EWS)** — price anomaly detection, risk levels, and HET (price ceiling) reference
- **Price Prediction** — 7-day forecast
- **Recommendations** — suggested actions
- **Data & Export** — download data (CSV / JSON / Excel)
- **Admin Panel** — data input, HET management, and audit log

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (Recharts, Leaflet)
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** Vercel (frontend + serverless API) with Neon (PostgreSQL)

## Project Structure

```
src/            Frontend (React)
server/src/     Backend (Express: app, routes, lib, middleware)
server/prisma/  Database schema & migrations
api/            Vercel serverless function entry
docs/           Project documents
scripts/        Data migration scripts
```

## Getting Started

### Prerequisites

Node.js 20+, npm, and a PostgreSQL database (local or [Neon](https://neon.tech)).

### Setup

```bash
npm install
```

Create a `.env` file (see `.env.example`):

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
ADMIN_SECRET="your-random-secret"
```

Prepare the database:

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed      # optional: seed initial data
```

Run the app (in two terminals):

```bash
npm run dev:api      # backend  -> http://localhost:3001
npm run dev          # frontend -> http://localhost:5173
```

Open http://localhost:5173. The frontend proxies `/api` to the backend (see
`vite.config.ts`), so you only need to open one address.

## Data

7 markets · 67 commodities · Jan–Dec 2024 (138,054 price points).
Source: Bapanas / SP2KP.

## Admin

- **URL:** `/login-admin`
- **Default credentials:** `admin` / `admin` — change these in production
  (set `ADMIN_USER` and `ADMIN_PASS` in the environment).
- **Features:** manage HET (price ceiling), import data (Excel / CSV / JSON),
  and view the audit log.

## Documentation

- `docs/notes/` — project notes and technical documentation
- `CONTRIBUTING.md` — contribution guide

## License

Internal project — Tim EWS.
