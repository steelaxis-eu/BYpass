'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin' // Admin needed for deletion/updates if RLS is strict
import { z } from 'zod'

const deletionRequestSchema = z.object({
    clientId: z.string().uuid()
})

export async function requestClientDeletion(formData: FormData) {
    const supabase = await createClient()

    // 1. Authorization (Only Masters/Admins can trigger this for now)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const clientId = formData.get('clientId') as string
    const parse = deletionRequestSchema.safeParse({ clientId })

    if (!parse.success) return { error: 'Invalid Client ID' }

    const supabaseAdmin = createAdminClient()

    // 2. Liability Check (The Core GDPR Conflict Logic)
    // "We need to keep data if there is a legal claim or potential for one."
    // Assumption: Statute of limitations is 3 years.

    const threeYearsAgo = new Date()
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

    const { count, error: countError } = await supabase
        .from('procedures')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', threeYearsAgo.toISOString())

    if (countError) return { error: 'Error checking liability records' }

    // 3. Decision Logic
    if (count && count > 0) {
        // CASE A: LIABILITY ACTIVE -> LEGAL HOLD
        // GDPR Art 17(3)(e): Right to erasure does NOT apply "for the establishment, exercise or defence of legal claims".

        const { error: updateError } = await supabaseAdmin
            .from('clients')
            .update({ status: 'legal_hold' })
            .eq('id', clientId)

        if (updateError) return { error: 'Failed to apply Legal Hold: ' + updateError.message }

        // Log the denial for accountability
        await supabaseAdmin.from('audit_logs').insert({
            user_id: user.id, // The master processing the request
            action: 'DATA_DELETION_DENIED_LEGAL_HOLD',
            table_name: 'clients',
            record_id: clientId,
            details: {
                reason: 'Active liability period (procedures < 3 years old)',
                procedures_count: count,
                timestamp: new Date().toISOString()
            }
        })

        return {
            success: false,
            message: `Deletion DENIED. Client placed on LEGAL HOLD. ${count} procedures found within the 3-year liability period. Data must be retained for legal defense until all procedures expire.`
        }

    } else {
        // CASE B: NO LIABILITY -> DELETE (Right to Erasure)
        // We can either hard delete or anonymize.

        // Option 1: Hard Delete (simplest, best for "Erasure")
        // But we must also delete linked procedures or cascade?
        // Procedures table has `client_id` FK. Ideally we anonymize the procedure but keep the stats?
        // For strictly legal app, we usually delete everything if they have no claims.
        // OR we just soft-delete the client.

        // Let's do Hard Delete for Client, but if procedures exist (older than 3 years), constraint will fail.
        // So we should verify if *any* procedures exist at all.

        const { count: totalProcedures } = await supabase
            .from('procedures')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId)

        if (totalProcedures && totalProcedures > 0) {
            // Older records exist (verified > 3 years by previous check).
            // We can't hard delete client if FK exists.
            // We should Anonymize client data in `clients` table.
            const { error: anonError } = await supabaseAdmin
                .from('clients')
                .update({
                    full_name: 'DELETED_USER',
                    personal_code_hash: 'DELETED_' + clientId, // Break the hash link
                    birth_date: '1900-01-01',
                    status: 'deleted'
                })
                .eq('id', clientId)

            if (anonError) return { error: 'Failed to anonymize: ' + anonError.message }

            return { success: true, message: 'Client liability expired. Personal data successfully ANONYMIZED.' }

        } else {
            // No procedures ever. Safe to Hard Delete.
            const { error: deleteError } = await supabaseAdmin
                .from('clients')
                .delete()
                .eq('id', clientId)

            if (deleteError) return { error: 'Failed to delete: ' + deleteError.message }

            return { success: true, message: 'Client successfully PERMANENTLY DELETED.' }
        }
    }
}
