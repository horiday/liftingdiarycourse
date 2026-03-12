# Server Components

## Overview

Server Components run exclusively on the server and are the default in Next.js App Router. They can directly access databases, files, and other server-side resources without exposing sensitive logic to the client.

## Params and SearchParams Must Be Awaited

**This is a Next.js 15 project. `params` and `searchParams` are now Promises and MUST be awaited before use.**

### Page Components

```tsx
// ✅ Correct — await params before accessing properties
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // use id...
}
```

```tsx
// ❌ Wrong — accessing params synchronously will cause a runtime error
export default async function WorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params; // This will fail in Next.js 15
}
```

### SearchParams

```tsx
// ✅ Correct
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
}
```

### Type Signatures

Always type `params` and `searchParams` as `Promise<...>`:

```tsx
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
```

## Data Fetching

Server Components can fetch data directly — no `useEffect` or API routes needed for read operations.

```tsx
// ✅ Fetch directly in the component
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await db.workout.findUnique({ where: { id } });

  return <WorkoutDetail workout={workout} />;
}
```

See `data-fetching.md` for full data fetching conventions.

## General Rules

- Mark components `async` when they need to `await` params, searchParams, or data.
- Do not use `useState`, `useEffect`, or other React hooks — use Client Components for interactivity.
- Keep Server Components lean: fetch data, pass it down as props to Client Components.
- Sensitive logic (DB queries, secrets) stays in Server Components, never in Client Components.
