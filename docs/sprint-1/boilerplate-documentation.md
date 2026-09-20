# Crack the Channel: Setup Guide
This document covers what has been included within the boilerplate and frontend spike as well as how members can get the app running locally

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
|   |   ├── simulator/
│   │   └── spike/
│   |       ├── learn/
│   |       ├── simulator/
│   |       └── layout.tsx
│   ├── components/
|   |   └── spike/
│   ├── lib/
│   │   ├── auth/
│   │   ├── spike/
│   │   ├── supabase/
|   |   └── validation/
│   ├── supabase/
│   │   └── migrations/
│   ├── public/
│   │   └── spike/
│   ├── middleware.ts
│   └── .env.local             <- not committed
```

## 2. Prerequisites

- Node.js 20+
- npm (this project uses npm)
- A Supabase account with access to the project (everyone has been invited to the project and should have administrative access)

---

## 3. What has been built so far

### Boilerplate

### Auth
- Email/password signup and login using Supabase Auth
- Email confirmation flow (`/auth/confirm` route handler)
- Cloudflare Turnstile CAPTCHA for signup and login (bot protection)
- Session handling via `@supabase/ssr`
- Middleware (`middleware.ts`) refreshes sessions automatically to stop user from being logged out mid use
- Basic user input validation via zod

### Onboarding
- New users are redirected to `/onboarding` to set their first/last names
- A database trigger automatically creates a `profiles` row for each user when they sign up

### Core database schema & logic
- `profiles`, `badges`, `user_badges` tables
- Row Level Security (RLS) enabled for table
- Users can only read/write their own data
- A protective trigger to stop users from directly editing protected columns:`xp`, `streak`, `last_challenge_date`, or `created_at`. These can only be updated server-side using the admin client

### Routing
- Protected routes (`/dashboard`, `/learn`, `/simulator`, `/profile`, `/spike`) require login + completed onboarding to access
- Auth check lives in `lib/auth/require-user.ts`

### Frontend Spike

### Stand in Rive Mascot
- Basic Rive mascot (not actual mascot, just stand in) that has working idle animation and changes moods when prompt
- Mood tracker (`mood.ts`) that aligns with mascot rive mmod variables
- Load in of mascot from Rive file (`mascot.tsx`). Loads mascot mood variables and creates set mood function
- Created a chatbubble for mascot to communicate with user (`chatbubble.tsx`)
- Created a placement lock that keeps the mascot set in the corner of the page (`mascotCorner.tsx`)

## Navigation
- Setup basic navigation bar for the 2 page spike (`navbar.tsx`)

## Layout
- Setup up basic full app layout base for font choice (currently Ubuntu)
- Setup navbar layout for spike

## Learning Page
- Single page that simulates mascot response to user choice input
- Setup as a multiple choice question: when user answers correctly the mascot is happy, when user answers incorrectly the mascot is sad

## Simulator Page
- Full BB84 frontend logic without Qiskit backend (`bb84Walkthrough.tsx`)
- User can choose to be any of the roles: Alice, Bob, Eve - the other roles are conducted as NPC's
- The user can select any basis for 6 bits of length,  user can't see what the other roles have input until comparison
- Eve can be toggled on and off
- Qiskit backend is simulated using randomised variables
- NPC roles also simulated using randomised variables
- Full single exchange round conducted and broken up into 5 parts - user cannot continue until input has been put in for selected role
- Mascot narration built in so that the mascot guides the user through the process step by step
- Mascot moods respond to user role choice and guide steps
- Mascot moods and narration is prompted by a narration event which is recieved by mascot

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

## 4. Sett up your local `.env.local`

Each member needs to create their own `my-app/.env.local` file 

Create `my-app/.env.local` with the following:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard -> Project Settings -> API Keys -> Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard -> Project Settings -> API Keys -> **Publishable key** (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Supabase dashboard -> Project Settings -> API Keys -> **Secret keys** (`sb_secret_...`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Ask Mackenzie for the sitekey |


**All members share the same Supabase project.** You don't need to create your own supabase project like you needed to for firebase local hosting

---

## 5. Run the App

```bash
cd my-app
npm install
npm run dev
```

Visit `http://localhost:3000`
You should land on the login page
Sign up and onboard yourself so you can look at the frontend spike

### Sign up
1. Go to `/signup`, create an account with your email
2. Check your email for the confirmation link (Supabase's default is capped at 2 emails/hour - we will fix this once we buy a domain)
3. Click the link, you should land on `/onboarding`
4. Fill in first/last name -> redirects to `/spike/simulator`

---

## 6. Database migrations

Migrations can be found in `my-app/supabase/migrations/`. If you need to make a schema change:

```bash
cd my-app
npx supabase migration new your_migration_name
```

Write your SQL in file that Supabase generates, then apply using:

```bash
npx supabase db push
```

**Important:** since everyone shares one project, migrations affect the live shared database immediately for the whole team. Because of this, please make sure to coordinate schema changes with the team before pushing, and always commit the migration file to the repo so everyone's local `supabase/migrations/` folder stays in sync. PLEASE!

You'll need to link the Supabase CLI to the project once. You can find the project id via Supabase dashboard -> Project settings -> General -> Project ID:

```bash
npx supabase login
npx supabase link --project-ref <project-id>
```

---

## 8. Who to ask if you need help

Mackenzie! She is the owner of the supabase project, she built the boilerplate, frontend spike and she has the turnstile key. Please ask her if you need help with anything or tell her if you find an issue (there could be some that weren't found, hopefully not)

## Sprint 2 Auth Update — Srilekha

The existing Supabase authentication flow was tested and extended during Sprint 2 Week 1.

### Changes implemented
- Added logout functionality using `supabase.auth.signOut()`.
- Added logout redirect to `/login`.
- Protected `/spike` routes using the existing `requireOnboarding()` authentication guard.
- Verified that authenticated users can access `/spike` routes.
- Verified that unauthenticated users are redirected to `/login` when attempting to access protected `/spike` routes.

### Handoff / Review
Mackenzie to review the authentication changes and confirm they are compatible with the existing Supabase/auth setup.