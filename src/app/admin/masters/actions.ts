'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createMasterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(2),
    salonName: z.string().min(2)
})

export async function createMaster(formData: FormData) {
    // 1. Authorization Check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check role in profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized: Admin access required' }
    }

    // 2. Validate Input
    const parsed = createMasterSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        fullName: formData.get('fullName'),
        salonName: formData.get('salonName')
    })

    if (!parsed.success) {
        return { error: 'Invalid input data: ' + JSON.stringify(parsed.error.flatten()) }
    }

    const data = parsed.data
    const supabaseAdmin = createAdminClient()

    // 3. Create User in Auth System
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.fullName }
    })

    if (authError || !newUser.user) {
        return { error: authError?.message || 'Failed to create auth user' }
    }

    // 4. Create Profile with 'master' role
    // We use admin client because RLS might block normal insert if not careful, 
    // though admin role usually has full access via RLS if configured.
    // Using admin client bypasses RLS for certainty here.
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: newUser.user.id,
            role: 'master',
            full_name: data.fullName,
            salon_name: data.salonName
        })

    if (profileError) {
        // Cleanup if profile fails (atomic-ish)
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
        return { error: 'Failed to create master profile: ' + profileError.message }
    }

    revalidatePath('/admin/masters')
    return { success: true, message: 'Master created successfully' }
}
