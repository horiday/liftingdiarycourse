# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-First Requirement

**Before generating any code, Claude Code MUST first check the `/docs` directory for relevant documentation.** Always read and follow the guidance in any applicable docs files before writing or modifying code. The `/docs` directory contains project-specific conventions, design decisions, and requirements that take precedence over general best practices.

### Documentation Files

- **auth.md** (`/docs/auth.md`): Clerk-based authentication standards, key APIs, and required environment variables.
- **data-fetching.md** (`/docs/data-fetching.md`): Rules for server-component-only data fetching via `/data` helpers using Drizzle ORM.
- **data-mutations.md** (`/docs/data-mutations.md`): Rules for server-action-only mutations in colocated `actions.ts` files with Zod validation.
- **routing.md** (`/docs/routing.md`): Route structure requiring all features under `/dashboard`, protected exclusively via middleware.
- **server-components.md** (`/docs/server-components.md`): Next.js 15 server component conventions, including awaiting `params` and `searchParams`.
- **ui.md** (`/docs/ui.md`): UI standards mandating shadcn/ui components and date-fns with `do MMM yyyy` format.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configured via `postcss.config.mjs`)
- **Geist** font family (sans + mono) loaded via `next/font/google`

## Architecture

This is a fresh Next.js App Router project with minimal code. All routes live under `src/app/`. The root layout (`src/app/layout.tsx`) applies Geist fonts and global styles. The home page (`src/app/page.tsx`) is the entry point to build from.

Tailwind CSS v4 is used — configuration is handled via PostCSS rather than a `tailwind.config.js` file.
