---
name: security-best-practices
description: Advanced Security guidelines including RLS, Middleware, GDPR Compliance, and Non-Repudiation Architecture.
---

# Security Best Practices

## 1. Database Security (Row Level Security)
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

**Pattern: Service Role RBAC**
Use a Service Role client in middleware to fetch user roles reliably, preventing "Admin Lockout" caused by restrictive RLS policies on the `profiles` table itself.

```typescript
// middleware.ts
const supabaseAdmin = createClient(to, key, { auth: { persistSession: false } }) // Service Role
const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
```

## 4. Secure Headers
Configure `next.config.js` to send secure headers.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy` (Strict CSP)

## 5. Zero-Trust Frontend Architecture
**NEVER** allow the frontend to write directly to the database (e.g., `supabase.from('table').insert()`). This requires exposing public RLS permissions.

**Pattern: Server Actions with Privilege Elevation**
1. Frontend calls a Server Action.
2. Server Action validates input (Zod).
3. Server Action verifies Auth (`getUser()`).
4. Server Action uses a `createAdminClient()` (Service Role) to execute the write.
This ensures the frontend has **zero** direct write access.

## 6. Non-Repudiation & Audit Logging
For legal/financial transactions, simple logs are insufficient. You must create a "Digital Seal".

**Pattern: Digital Artifacts**
Capture the following metadata at the moment of signing/submission:
- **IP Address** & **User Agent** (Context)
- **Content Hash (SHA-256)**: Create a cryptographic hash of the JSON data being signed. If the record changes later, the hash won't match.
- Store these in an immutable `audit_logs` table (Insert Only).

```typescript
const hash = crypto.createHash('sha256').update(JSON.stringify(coreData)).digest('hex')
await adminDb.from('audit_logs').insert({ action: 'SIGNATURE', hash, ip, user_agent })
```

## 7. GDPR Compliance: Legal Hold
Balance "Right to Erasure" with "Liability Retention".

**Pattern: Conditional Deletion**
When a delete request comes in:
1. Check for active liability (e.g., transactions < 3 years old).
2. **If Active**: DENY deletion. Set status to `legal_hold`. Minimize data access but retain for defense.
3. **If Expired**: Perform Hard Delete or Anonymization (scramble PII keys).

## 8. Secure Client Lookup (Privacy Preserving)
Do not expose searchable PII (like Personal IDs) to the client.

**Pattern: Deterministic Hashing**
- Store `personal_code_hash = sha256(personal_code)` in the DB.
- When searching, the client sends the *code*, the server hashes it, and queries by *hash*.
- This allows looking up a user without indexing or exposing raw personal codes in the API or logs.
