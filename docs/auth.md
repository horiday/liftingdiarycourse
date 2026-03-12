# Authentication

This app uses [Clerk](https://clerk.com) for all authentication and user management.

## Standards

- **Never implement custom auth logic.** All authentication is handled by Clerk.
- Use Clerk's hooks and components for all auth-related UI and logic.
- Use Clerk's middleware for protecting routes.

## Key APIs

### Client-side (React components)
- `useUser()` — access the current user object
- `useAuth()` — access auth state (`isSignedIn`, `userId`, etc.)
- `<SignIn />`, `<SignUp />` — Clerk's pre-built auth UI components
- `<UserButton />` — pre-built user profile/sign-out button
- `<SignedIn>`, `<SignedOut>` — conditional rendering based on auth state

### Server-side (App Router)
- `auth()` — get auth state in Server Components and Route Handlers
- `currentUser()` — get the full user object in Server Components
- `clerkMiddleware()` — protect routes via `middleware.ts`

## Route Protection

Use `clerkMiddleware` in `src/middleware.ts` to protect routes. Public routes must be explicitly allowed; all other routes require authentication by default.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
```

## User Identity

- The Clerk `userId` is the authoritative user identifier throughout the app.
- When storing user-related data in the database, always reference `userId` from Clerk.
- Do not store passwords or sensitive credentials — Clerk manages all of that.

## Environment Variables

Required Clerk environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Optional redirect overrides:

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```
