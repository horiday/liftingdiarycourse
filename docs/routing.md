# Routing Standards

## Route Structure

All application routes must be nested under `/dashboard`. There are no top-level feature routes (e.g. no `/workouts`, `/profile` at the root level).

```
/dashboard              → main dashboard page
/dashboard/workouts     → workouts list
/dashboard/workouts/new → create workout
/dashboard/[...]        → any other feature pages
```

## Route Protection

All `/dashboard` routes are protected and require an authenticated user.

**Protection is implemented exclusively via Next.js Middleware** (`src/middleware.ts`). Do not implement redirect logic inside individual page components or layouts.

The middleware must:
- Check for a valid session on every `/dashboard/*` request
- Redirect unauthenticated users to `/` (or a login page) with a `callbackUrl` if appropriate
- Allow public routes (e.g. `/`, `/api/auth/*`) to pass through without auth checks

## Example Middleware Pattern

```ts
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const session = request.cookies.get("session"); // or auth token
    if (!session) {
      const loginUrl = new URL("/", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

> Adapt the session check to match the auth strategy documented in `docs/auth.md`.

## Rules

- **No feature routes outside `/dashboard`** — every authenticated feature lives under this prefix.
- **No auth guards in page files** — middleware is the single source of truth for route protection.
- **Public routes** (`/`, `/api/auth/*`, static assets) must never be blocked by the middleware matcher.
