# Data Fetching

## CRITICAL: Server Components Only

**ALL data fetching in this application MUST be done exclusively via React Server Components.**

This is a non-negotiable architectural rule. The following approaches are strictly forbidden:

- **Route Handlers** (`app/api/` routes) — do NOT use these for fetching data for the UI
- **Client Components** (`"use client"`) — do NOT fetch data inside client components
- **`useEffect` + `fetch`** — forbidden
- **SWR / React Query / any client-side fetching library** — forbidden
- **`getServerSideProps` / `getStaticProps`** — not applicable (App Router), but forbidden in spirit

Data flows in one direction: **server component fetches → passes props down to client components** (for interactivity only).

---

## CRITICAL: Data Access via `/data` Directory Only

**ALL database queries MUST go through helper functions located in the `/data` directory.**

Never query the database directly from a page, layout, or component. Always call a helper function from `/data`.

### Rules for `/data` helper functions

1. **Use Drizzle ORM exclusively** — do NOT write raw SQL strings. Ever.
2. **Always scope queries to the authenticated user** — every query that returns user-owned data MUST filter by the current user's ID.
3. **Never expose data belonging to other users** — a logged-in user must only be able to access their own records.

### Example structure

```
/data
  workouts.ts     # e.g. getUserWorkouts(userId), getWorkoutById(userId, workoutId)
  exercises.ts    # e.g. getUserExercises(userId)
  ...
```

### Example helper function

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutById(userId: string, workoutId: string) {
  return db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)  // ALWAYS scope to the current user
    ),
  });
}
```

**Never omit the `userId` filter.** A query without a user scope is a data leak.

### Example server component usage

```tsx
// app/dashboard/page.tsx (Server Component — no "use client")
import { auth } from "@/auth";
import { getUserWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getUserWorkouts(session.user.id);

  return <WorkoutList workouts={workouts} />;
}
```

---

## Summary Checklist

Before writing any data-access code, verify:

- [ ] The fetch happens inside a Server Component (no `"use client"` at the top)
- [ ] The query is delegated to a `/data` helper function
- [ ] The helper uses Drizzle ORM (no raw SQL)
- [ ] The query filters by `userId` to ensure data isolation
