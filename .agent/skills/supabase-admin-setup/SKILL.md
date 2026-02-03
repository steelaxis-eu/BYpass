---
name: supabase-admin-setup
description: Steps and best practices for setting up the Supabase Admin client for server-side operations.
---

# Supabase Admin Setup Skill

This skill guides you through setting up the Supabase Admin client for privileged operations like creating users without email confirmation or managing other users' data.

## 1. Environment Variables

Ensure your `.env.local` has the service role key. **NEVER** expose this to the client.

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-starts-with-eyJh
```

## 2. Create Admin Client (`utils/supabase/admin.ts`)

Create a dedicated client for admin operations. This client uses the `SUPABASE_SERVICE_ROLE_KEY`.

```typescript
import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

## 3. Server Action Pattern

When using this in Server Actions, ensure tight validation and security checks.

```typescript
'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { z } from 'zod'

// Define Schema
const inputSchema = z.object({
  email: z.string().email(),
  // ... other fields
})

export async function adminAction(formData: FormData) {
  // 1. Authorization Check (CRITICAL)
  // Ensure the caller is an actual admin using the standard client
  // const user = await getUser(normalClient);
  // if (user.role !== 'admin') throw new Error('Unauthorized');

  // 2. Setup Admin Client
  const supabaseAdmin = createAdminClient()

  // 3. Perform Privileged Operation
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: '...',
    email_confirm: true 
  })
}
```

## 4. Security Checklist
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is ONLY in `.env.local` and never prefixed with `NEXT_PUBLIC_`.
- [ ] Admin client is ONLY imported and used in Server Actions or Route Handlers (never in Client Components).
- [ ] Every admin action checks the calling user's permissions first using a standard (non-admin) client.
