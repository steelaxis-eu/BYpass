'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createMasterSchema = z.object({
    email: z.string().email(),
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
        fullName: formData.get('fullName'),
        salonName: formData.get('salonName')
    })

    if (!parsed.success) {
        return { error: 'Invalid input data: ' + JSON.stringify(parsed.error.flatten()) }
    }

    const data = parsed.data
    const supabaseAdmin = createAdminClient()

    // 3. Invite User by Email
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
            data: { full_name: data.fullName },
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        }
    )

    if (inviteError || !inviteData.user) {
        return { error: inviteError?.message || 'Failed to send invitation' }
    }

    // 4. Create Profile with 'master' role
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: inviteData.user.id,
            role: 'master',
            full_name: data.fullName,
            salon_name: data.salonName
        })


    if (profileError) {
        // Cleanup if profile fails
        await supabaseAdmin.auth.admin.deleteUser(inviteData.user.id)
        return { error: 'Failed to create master profile: ' + profileError.message }
    }

    revalidatePath('/admin/masters')
    return { success: true, message: 'Invitation sent and master created successfully' }
}
