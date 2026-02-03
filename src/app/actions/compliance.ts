'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { z } from 'zod'

const adverseEventSchema = z.object({
    procedureId: z.string().uuid(),
    clientId: z.string().uuid(),
    severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
    description: z.string().min(10, 'Description must be detailed'),
    actionTaken: z.string().min(5, 'Action taken is required')
})

export async function reportAdverseEvent(formData: FormData) {
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Parse Data
    const rawData = {
        procedureId: formData.get('procedureId'),
        clientId: formData.get('clientId'),
        severity: formData.get('severity'),
        description: formData.get('description'),
        actionTaken: formData.get('actionTaken')
    }

    const validation = adverseEventSchema.safeParse(rawData)
    if (!validation.success) return { error: 'Validation failed' }

    const data = validation.data

    const supabaseAdmin = createAdminClient()

    // 3. Insert Record
    const { data: event, error: insertError } = await supabaseAdmin
        .from('adverse_events')
        .insert({
            procedure_id: data.procedureId,
            client_id: data.clientId,
            master_id: user.id,
            severity: data.severity,
            description: data.description,
            action_taken: data.actionTaken
        })
        .select()
        .single()

    if (insertError) return { error: 'Failed to log event: ' + insertError.message }

    // 4. Audit Log (Critical for Insurance Defense)
    await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'ADVERSE_EVENT_REPORTED',
        table_name: 'adverse_events',
        record_id: event.id,
        details: {
            severity: data.severity,
            procedureId: data.procedureId,
            timestamp: new Date().toISOString()
        }
    })

    return { success: true, message: 'Adverse event recorded and sealed.' }
}
