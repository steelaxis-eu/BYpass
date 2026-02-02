---
name: security-best-practices
description: Security guidelines including RLS, Middleware, and Input Validation.
---

# Security Best Practices

## 1. Database Security (RLS)
**NEVER** toggle "Enable Row Level Security" off.
Every table must have policies for SELECT, INSERT, UPDATE, DELETE.

**Pattern: Deny by Default**
Start with no policies (implies nobody can access). Add policies explicitly to allow access.

```sql
create policy "Users can view own data" 
on public.table_name 
for select 
using (auth.uid() = user_id);
```

## 2. Input Validation (Zod)
Validate ALL inputs in Server Actions using Zod. Never trust client data.

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
});

const result = schema.safeParse(data);
if (!result.success) throw new Error('Invalid Input');
```

## 3. Middleware Protection
Protect sensitive routes (`/admin/*`) in `middleware.ts`. Do not rely solely on Client Components for redirecting.

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
}
```

## 4. Headers
Configure `next.config.js` to send secure headers.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy` (Strict CSP)
