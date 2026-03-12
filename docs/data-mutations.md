# Data Mutations

## CRITICAL: Server Actions Only

**ALL data mutations in this application MUST be done exclusively via Next.js Server Actions.**

This is a non-negotiable architectural rule. The following approaches are strictly forbidden:

- **Route Handlers** (`app/api/` routes) — do NOT use these for mutating data
- **Client-side `fetch`** — do NOT call mutation endpoints from client components directly
- **`useEffect` + `fetch`** — forbidden
- **Direct database calls from components or pages** — forbidden

---

## CRITICAL: Data Access via `/data` Directory Only

**ALL database mutation logic MUST go through helper functions located in the `src/data` directory.**

Never call Drizzle ORM directly from a server action. Always delegate the actual db call to a helper function in `src/data`.

### Rules for `/data` mutation helpers

1. **Use Drizzle ORM exclusively** — do NOT write raw SQL strings. Ever.
2. **Always scope mutations to the authenticated user** — every insert, update, or delete that operates on user-owned data MUST include the current user's ID to prevent cross-user data tampering.
3. **Return the mutated record** where useful, so the caller can act on the result.

### Example structure

```
src/data/
  workouts.ts     # e.g. createWorkout(), updateWorkout(), deleteWorkout()
  exercises.ts    # e.g. createExercise(), deleteExercise()
  ...
```

### Example mutation helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId))); // ALWAYS scope to the current user
}
```

**Never omit the `userId` filter on updates and deletes.** A mutation without a user scope is a security vulnerability.

---

## CRITICAL: Server Actions in Colocated `actions.ts` Files

**ALL server actions MUST live in a file named `actions.ts` colocated with the route or feature they serve.**

### Rules for server actions

1. **Always include `"use server"` at the top of the file.**
2. **Parameters MUST be typed** — use explicit TypeScript types for every argument. Never use `any`.
3. **`FormData` is forbidden as a parameter type** — always accept typed, structured arguments instead.
4. **ALL arguments MUST be validated with Zod** before any logic is executed.
5. **Always authenticate** — call `auth()` at the start of every action and throw/return early if there is no session.
6. **Delegate db work to `src/data` helpers** — do not call Drizzle directly inside an action.

### Example colocated structure

```
src/app/
  workouts/
    new/
      page.tsx
      actions.ts   ← server actions for this route
```

### Example server action

```ts
// src/app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(params: {
  name: string;
  date: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = createWorkoutSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const workout = await createWorkout(
    session.user.id,
    parsed.data.name,
    parsed.data.date
  );

  return { data: workout };
}
```

---

## Summary Checklist

Before writing any data mutation code, verify:

- [ ] The mutation is triggered via a Server Action (no direct API calls from the client)
- [ ] The server action lives in a colocated `actions.ts` file
- [ ] The file has `"use server"` at the top
- [ ] All parameters are explicitly typed (no `any`, no `FormData`)
- [ ] Arguments are validated with Zod before any logic runs
- [ ] The action authenticates the user via `auth()` and returns early if unauthenticated
- [ ] The actual db call is delegated to a helper in `src/data`
- [ ] The `src/data` helper uses Drizzle ORM (no raw SQL)
- [ ] Updates and deletes scope to `userId` to prevent cross-user tampering
