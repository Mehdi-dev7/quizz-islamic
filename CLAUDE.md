# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to DB (SQLite dev.db)
npm run db:seed      # Seed the database (prisma/seed.ts)
npm run db:studio    # Open Prisma Studio GUI
```

## Project Overview

Application quiz islamique — projet de collège. Les utilisateurs s'inscrivent avec un pseudo et progressent via un système de **niveaux + XP** : plus le niveau est élevé, plus les questions sont difficiles (`difficulty` field sur `Question`).

**Catégories de questions prévues :** La Prière, Les Prophètes, Le Ramadan, La Vie du Prophète.

**Modes de jeu :**
- **Entraînement par catégorie** — 10 questions par session, filtrées par catégorie. Difficulté adaptée au niveau du joueur. Pas de classement.
- **Examen** (`isExam: true`) — 10 questions par catégorie + 5 questions bonus très difficiles (`isBonus: true`). Le score final (nombre de bonnes réponses) est enregistré dans le `Leaderboard` à la fin.

**Classement (Leaderboard) :**
- Basé sur le meilleur score à l'examen (nombre de bonnes réponses)
- Le niveau de l'utilisateur est aussi pris en compte
- Uniquement alimenté par les examens, pas par l'entraînement

**Progression utilisateur :**
- Chaque bonne réponse rapporte des XP
- Le niveau monte automatiquement en fonction des XP accumulés
- Les questions difficiles (`difficulty`) sont débloquées avec le niveau

## Architecture

Islamic quiz app built with Next.js 16 App Router, Tailwind CSS v4, MongoDB (Mongoose), `next-intl` for i18n, and custom JWT auth (no NextAuth/BetterAuth).

### Routing

All user-facing routes are under `app/[locale]/` — the locale segment is always present (`localePrefix: 'always'`). Supported locales: `en`, `fr`, `ar` (default: `en`), defined in `lib/i18n-config.ts`.

Route groups:
- `app/[locale]/(main)/` — authenticated app (categories, quiz, etc.)
- `app/[locale]/(auth)/` — login & register pages
- `app/api/auth/` — REST API routes (login, register, logout, me)

### Auth

Custom JWT-based auth in `lib/jwt.ts`. Token stored as an `httpOnly` cookie (`auth-token`, 7-day expiry). No third-party auth library. The `app/api/auth/me` route is used to hydrate the current user on the client side.

### Database

MongoDB via Mongoose (Atlas cloud). Key models in `lib/models/`:
- `User` — pseudo + hashed password (bcrypt), XP & level system
- `Category` — quiz categories with icon/color/slug/order
- `Question` — multilingual (EN/FR/AR), 4 options + correctAnswer index, difficulty 1-5, isBonus flag, explanations

Seed: `npm run db:seed` → runs `scripts/seed.ts` (wipes + reseeds everything).
Reset a password: `npx tsx scripts/reset-password.ts <pseudo> <newPassword>`

**4 categories seeded (200 questions total):**
- Vie du Prophète (`vie-prophete`, order 1) — 50 questions
- La Prière (`salat`, order 2) — 50 questions
- Le Jeûne (`jeune`, order 3) — 50 questions
- Histoires des Prophètes (`histoires-prophetes`, order 4) — 50 questions

### i18n

`next-intl` v4. Translation files in `locales/en.json`, `locales/fr.json`, `locales/ar.json`. Routing config in `i18n/routing.ts`, request config in `i18n/request.ts`. Arabic requires RTL layout handling.

Questions are stored multilingual directly in the DB (columns like `questionEn`, `questionFr`, `questionAr`) — not via translation files.

### Key files

| File | Purpose |
|------|---------|
| `lib/db.ts` | Prisma client singleton |
| `lib/jwt.ts` | Token sign/verify/cookie helpers |
| `lib/i18n-config.ts` | Locale list, names, flags |
| `i18n/routing.ts` | next-intl routing config |
| `prisma/schema.prisma` | Full DB schema |
| `prisma/seed.ts` | DB seed script |
