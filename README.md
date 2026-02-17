# Small Group Connect

Mobile-first app (iOS, Android, web) for connecting small group members. Features: announcements, snack sign-up, discussion topic + Bible text, birthdays, prayer requests, Bible verse memory.

## Stack

- **Mobile + Web**: Expo (React Native) in `apps/expo`
- **API**: Next.js on Vercel in `apps/api`
- **Auth**: Supabase Auth
- **Database**: Supabase (Postgres), Drizzle ORM

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. **Database**: Project Settings → Database → Connection string (URI). Copy it and set `DATABASE_URL` in `apps/api/.env.local`.
3. **API keys**: Project Settings → API. Copy **Project URL** and **anon public** key.
4. In `apps/api`, copy `.env.example` to `.env.local` and set:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. In `apps/expo`, copy `.env.example` to `.env` and set:
   - `EXPO_PUBLIC_API_URL` (e.g. `http://localhost:3001` for local)
   - `EXPO_PUBLIC_SUPABASE_URL` (same as API)
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` (same as API)

Run migrations:

```bash
cd apps/api && npm run db:migrate
```

### 2. Run locally

```bash
# From repo root
npm install

# Terminal 1: API
npm run dev:api

# Terminal 2: Expo (iOS / Android / web)
npm run dev:expo
```

Open the Expo app and sign up with email/password. The first user in the group is an admin.

## Scripts

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev:api`   | Start Next.js API (port 3001) |
| `npm run dev:expo`  | Start Expo dev server        |
| `npm run build:api` | Build API for Vercel         |
| `npm run build -w mobile` | Build Expo web (static export) |

## Web deployment (Vercel)

1. **API**: Create a Vercel project linked to this repo. Set **Root Directory** to `apps/api`. Add env vars: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Deploy.
2. **Expo web**: In `apps/expo`, set `EXPO_PUBLIC_API_URL` to your API URL. Run `npm run build` inside `apps/expo` and deploy the output (e.g. `dist/`) as a static site.

## App store (EAS Build)

1. Install EAS CLI: `npm i -g eas-cli` and run `eas login`.
2. From `apps/expo`: `eas build --platform all --profile production` (or `--profile preview` for internal).
3. Submit: `eas submit --platform all --profile production` (fill in `eas.json` submit section as needed).

## Project structure

```
apps/
  api/       Next.js API (Supabase Auth + Postgres, Drizzle)
  expo/      Expo app (React Native + web), EAS Build config in eas.json
```
