# Contributing — SIMONPEDIA Bapok Surabaya

Thanks for contributing to this project. This guide explains how to set up the
project on your machine, how to submit changes, and the conventions the team
follows.

> **Branch workflow note:** for now, all work uses the `main` branch. If the
> team grows, we may switch to a `feature/xxx` → PR → `main` flow. This guide
> will be updated if that happens.

---

## 1. Prerequisites

- Node.js 20 or later and npm
- Git
- PostgreSQL — local is fine, but a free cloud option like
  [Neon](https://neon.tech) is easier
- A GitHub account

---

## 2. Become a Collaborator

1. The repo owner invites you: **Settings → Collaborators → Add people**.
2. You'll receive a GitHub email/notification. Click **Accept invitation**.
3. Once accepted, you have **Write** access to this repo.

If you haven't received the invitation, check your email's spam folder too.

---

## 3. Clone the Project

```bash
git clone https://github.com/mpuss37/simonpedia-bapok-surabaya.git
cd simonpedia-bapok-surabaya
```

---

## 4. Configure Your Git Identity (IMPORTANT)

To make sure your contributions are attributed correctly on GitHub, ensure your
Git name and email match your GitHub account:

```bash
git config --global user.name "Your GitHub Name"
git config --global user.email "your-github-email@example.com"
```

You can find this email at https://github.com/settings/emails. If you don't
want to use your personal email, GitHub provides a dedicated `noreply` email.

If your Git email differs from your GitHub email, your commits still land in the
repo, but they won't count toward your contributor graph.

---

## 5. Set Up the Project Locally

```bash
npm install
```

Create a `.env` file at the root (see `.env.example` for the full example):

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
VITE_API_URL=
```

Notes:
- `DATABASE_URL` — the PostgreSQL connection string (Neon or local).
- `VITE_API_URL` — leave empty. The frontend automatically uses the `/api` path.

Prepare the database:

```bash
npx prisma generate
npx prisma migrate deploy        # or: npx prisma migrate dev
npm run db:seed                  # optional: seed initial data
```

Run the app (two terminals required):

```bash
# Terminal 1 — backend (port 3001)
npm run dev:api

# Terminal 2 — frontend (port 5173)
npm run dev
```

Then open http://localhost:5173

> In dev mode, the frontend proxies `/api` requests to the backend on port 3001
> (see `vite.config.ts`). So you only need to open one address.

---

## 6. Project Structure

```
src/         Frontend — React + Vite + Tailwind
server/      Backend — Express + Prisma + PostgreSQL
  prisma/    Database schema and migrations
  src/       API routes
api/         Serverless function for Vercel deployment
docs/        Project documents (BPMN, etc.)
```

---

## 7. How to Submit Changes

Since we currently use `main`, the flow is simple:

```bash
git pull origin main            # make sure you have the latest code first
# make your changes...
git add .
git commit -m "feat: short description"
git push origin main
```

**Tip:** for anything reasonably large, it's safer to create your own branch so
`main` stays stable:

```bash
git checkout -b feature/short-name
# work, commit, then push
git push -u origin feature/short-name
```

Then open a **Pull Request** from your branch to `main` so it can be reviewed
before merging.

---

## 8. Code & Commit Conventions

- Language: **TypeScript**. Run the type check before submitting:
  ```bash
  npx tsc -b
  ```
- **Lint**: `npx eslint src/` — aim for a clean run with no errors.
- Commit message format (Conventional Commits):
  ```
  feat: new feature
  fix: bug fix
  refactor: change code without changing behavior
  docs: documentation changes
  ```
- Each commit/contribution should focus on a single concern.
- **Never** commit `.env` files, tokens, or any credentials.

---

## 9. Checklist Before Submitting

- [ ] `npx tsc -b` passes with no errors
- [ ] `npx eslint src/` is clean
- [ ] `npm run build` succeeds
- [ ] No `.env` files or tokens are included in the commit
- [ ] Commit messages are clear and follow the format

---

## 10. Get the Latest Updates

```bash
git checkout main
git pull origin main
```

If you're working on your own branch and want to merge the latest updates:

```bash
git checkout feature/short-name
git merge main
```

---

## 11. Need Help?

Open an **Issue** in this repo and describe your problem. Include the error
message and the steps you've already tried so it's easier to help.
