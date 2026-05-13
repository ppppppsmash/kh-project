# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Internal management system (ADiXi) built with Next.js 15 App Router. Features task management, Q&A, surveys, club activities, member profiles, and team management. Japanese comments are common throughout the codebase.

## Commands

- `pnpm dev` — Start dev server with Turbopack
- `pnpm build` — Production build
- `pnpm format` — Format with Biome (`biome check --apply *`)
- `pnpm lint` — ESLint via Next.js
- `pnpm db:generate` — Generate Drizzle migrations from schema changes
- `pnpm db:migrate` — Run pending migrations
- `pnpm db:push` — Push schema directly to database (no migration files)

No test suite is configured.

## Architecture

### Route Groups (App Router)

- `app/(auth)/signin` — Public sign-in page
- `app/external/` — Public pages (QA, club activities, intro cards) — no auth required by middleware
- `app/adixi-public/` — Pages for `admin` role users
- `app/(protected)/superadmin/` — Protected admin dashboard with sidebar layout

### Auth & Access Control

- **NextAuth v5 beta** with Google OAuth (`auth.ts`)
- JWT strategy, 4-hour session max age
- Email domain restriction via `GOOGLE_ADMIN_EMAIL_DOMAIN` env var
- Session is extended with `id` and `role` fields (`next-auth.d.ts`)
- `middleware.ts` enforces role-based routing:
  - `superadmin` → `/superadmin/dashboard`
  - `admin` → `/adixi-public/qa`
  - Unauthenticated → `/signin`
  - Root `/` → `/external/qa`

### Database

- **Drizzle ORM** with PostgreSQL (Supabase)
- Connection: `db/index.ts` — single `postgres` client with `prepare: false` (required for Supabase transaction pool mode)
- Schema definitions: `db/schema/` — each entity in its own subdirectory, re-exported from `db/schema/index.ts`
- Key tables: `users`, `tasks`, `qa`, `club_activity`, `surveys` (with `survey_items`, `survey_responses`, `survey_response_items`), `categories`, `tabs`, `task_tabs`, `user_activity`, `leader_teams`, `manager_teams`
- Migrations output: `drizzle/` directory

### Server Actions

All business logic lives in `actions/*.ts` as `"use server"` functions. Most mutations also write to the `user_activity` audit log via `actions/user-activity.ts`, capturing old/new data for change tracking.

Key actions: `task.ts`, `qa.ts`, `user.ts`, `survey.ts`, `club-activity.ts`, `categories.ts`, `tabs.ts`, `presence.ts` (heartbeat for online status).

### State & Data Fetching

- **React Query** (`@tanstack/react-query`) for client-side data fetching, configured in `providers/query-provider.tsx`
- **Zustand** stores in `lib/store/` for UI state (member display, tab selection, table state, task state)
- Server actions called directly from components for mutations

### UI Stack

- **Tailwind CSS 4** with CSS variables for theming (light/dark via `next-themes`)
- **shadcn/ui** components (configured in `components.json`, new-york style)
- **Radix UI** primitives underneath shadcn
- **motion** library for animations
- **Vercel Blob** for image uploads (`lib/blob.ts`)
- **Slack webhook** notifications (`lib/slackMessage.ts`)

### Code Style

- **Biome** formatter: tabs, semicolons, trailing commas, line width 80
- Path alias: `@/*` maps to project root
- Zod schemas for form validation in `lib/validations.ts`

## Environment Variables

```
DATABASE_URL                     # PostgreSQL connection (Supabase)
NEXTAUTH_SECRET                  # JWT signing secret
NEXTAUTH_URL                     # e.g. http://localhost:3000
GOOGLE_CLIENT_ID                 # Google OAuth
GOOGLE_CLIENT_SECRET             # Google OAuth
GOOGLE_ADMIN_EMAIL_DOMAIN        # Allowed email domain (e.g. @gmail.com)
SLACK_WEBHOOK_URL                # Slack notifications
BLOB_READ_WRITE_TOKEN            # Vercel Blob storage
NEXT_PUBLIC_SHARE_URL            # Public share URL for external pages
```

## Deployment

Deployed on **Vercel** with **Supabase** as the database backend. `vercel.json` overrides install to `pnpm install --no-frozen-lockfile`.
