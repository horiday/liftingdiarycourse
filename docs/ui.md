# UI Coding Standards

## Component Library

**All UI components MUST use shadcn/ui exclusively.**

- Do NOT create custom components
- Do NOT use any other component library (MUI, Chakra, Radix directly, etc.)
- Every UI element must be built from shadcn/ui components
- If a shadcn/ui component does not exist for a use case, compose it using existing shadcn/ui primitives

Install components via:
```bash
npx shadcn@latest add <component-name>
```

## Date Formatting

Dates must be formatted using **date-fns** only.

### Format

All dates displayed to users must follow this format:

```
do MMM yyyy
```

Examples:
- `1st Mar 2026`
- `2nd Feb 2026`
- `3rd Jan 2026`
- `15th Nov 2025`

### Usage

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy");
```

Do not use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.
