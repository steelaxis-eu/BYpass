---
name: nextjs-best-practices
description: Best practices for building performant apps with Next.js 15.
---

# Next.js 15 Best Practices

## 1. Server Actions for Mutations
Use Server Actions for all data mutations (Forms, Button clicks that change data).
- Invoke `revalidatePath('/path')` to update the cache instantly.
- Return structured objects `{ success: boolean, message?: string, errors?: any }`.

## 2. Server Components for Fetching
Fetch data directly in Server Components. It's secure and fast.

```tsx
// app/page.tsx
export default async function Page() {
  const { data } = await supabase.from('procedures').select();
  return <ProcedureList items={data} />
}
```

## 3. Suspense & Streaming
Wrap slow components in `<Suspense fallback={<Loading />}>`.
This allows the main shell to load immediately while data fetches in parallel.

## 4. Error Handling
Create `error.tsx` (must be Client Component) in route segments to handle runtime errors gracefully.

## 5. Folder Structure
- `app/(auth)/login`: Group routes requiring similar layouts.
- `components/ui`: Generic UI components (Buttons, Inputs).
- `components/features`: Business-logic coupled components.
