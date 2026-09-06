# Crack the Channel — Dev Setup Guide

This document covers what was built for the boilerplate and what each team member will need to do to get the app running locally

---

## 1. Project structure
```
crack-the-channel-capstone-team87/
├── docs/
├── my-app/                   
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── email-confirmation/
│   |   │   ├── login/
│   |   │   └── signup/
│   │   ├── api/
│   |   │   ├── agent/
│   |   │   └── simulator/
|   |   ├── auth/
│   │   │   └── confirm/
|   |   ├── dashboard/
|   |   ├── learn/
|   |   ├── onboarding/
|   |   ├── profile/
│   │   │   └── edit/
|   |   └── simulator/
│   ├── lib/
│   │   ├── auth/
│   │   ├── supabase/
|   |   └── validation/
│   ├── supabase/
│   │   └── migrations/
│   ├── middleware.ts
│   └── .env.local             <- not committed
```

## 2. Prerequisites

- Node.js 20+
- npm (this project uses npm)
- A Supabase account with access to the shared project (everyone has been invited to the project and should have administrative access)

---

## 3. What has been built

### Auth
- Email/password signup and login via Supabase Auth
- Email confirmation flow (`/auth/confirm` route handler)
- Cloudflare Turnstile CAPTCHA on signup and login (bot protection)
- Session handling via `@supabase/ssr`, sessions live in httpOnly cookies
- Middleware (`middleware.ts`) refreshes sessions automatically on every request to ensure user isn't logged out mid use
- Basic user input validation via zod

### Onboarding
- New users are redirected to `/onboarding` to set their first/last name before reaching the dashboard
- A database trigger automatically creates a `profiles` row when a user signs up

### Core database schema & logic
- `profiles`, `badges`, `user_badges` tables
- Row Level Security (RLS) enabled on every table. Users can only read/write their own data
- A protective trigger prevents users from directly editing `xp`, `streak`, `last_challenge_date`, or `created_at` on their own profile, these must be updated server-side using the admin client

### Routing
- Protected routes (`/dashboard`, `/learn`, `/simulator`, `/profile`) require login + completed onboarding
- Shared check lives in `lib/auth/require-user.ts`


### Not yet built
- Qiskit/FastAPI service 
- AI agent logic (`/api/agent` route is a placeholder)
- Learning logic
- Profile editing logic
- Badge award logic
- Daily challenge logic
- All UI - waiting on UI finalisation
- CI/CD workflow - need to do so through github


---

## 4. Setting up your local `.env.local`

Each team member needs to create their own `my-app/.env.local` file 

Create `my-app/.env.local` with the following:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

```

### Where to get each key

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard -> Project Settings -> API Keys -> Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard -> Project Settings -> API Keys -> **Publishable key** (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Supabase dashboard -> Project Settings -> API Keys -> **Secret keys** (`sb_secret_...`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Ask Mackenzie for the sitekey |


**All team members share the same Supabase project.** You don't need to create your own supabase project like you needed to for firebase local hosting


---

## 5. Getting the app running

```bash
cd my-app
npm install
npm run dev
```

Visit `http://localhost:3000`
You should land on the login page!

### Testing the full flow
1. Go to `/signup`, create a test account with any email you have access to
2. Check your email for the confirmation link (Supabase's default mailer is capped at 2 emails/hour)
3. Click the link, you should land on `/onboarding`
4. Fill in first/last name -> redirects to `/dashboard`

---

## 6. Database migrations

Migrations live in `my-app/supabase/migrations/`. If you need to make a schema change:

```bash
cd my-app
npx supabase migration new your_migration_name
```

Write your SQL in the generated file, then apply it:

```bash
npx supabase db push
```

**Important:** since everyone shares one Supabase project, migrations affect the live shared database immediately for the whole team. Because of this, please make sure to coordinate schema changes with the team before pushing, and always commit the migration file to the repo so everyone's local `supabase/migrations/` folder stays in sync. PLEASE!

You'll need to link the Supabase CLI to the project once, the first time. You can find the project id via Supabase dashboard -> Project settings -> General -> Project ID:

```bash
npx supabase login
npx supabase link --project-ref <project-id>
```

---

## 8. Who to ask if you need help

Mackenzie! She is the owner of the supabase project, she built the boilerplate and she has the turnstile key. Please ask her if you need help with anything or tell her if you find an issue