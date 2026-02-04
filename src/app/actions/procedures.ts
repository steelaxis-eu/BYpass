'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { z } from 'zod'
import crypto from 'crypto'

const procedureSchema = z.object({
    clientName: z.string().min(2, "Client name required"),
    personalCode: z.string().min(5, "Personal ID required"),
    birthDate: z.string().date("Invalid birth date"),
    procedureType: z.string().min(2),
    pigment: z.string().min(1, "Pigment required"),
    shade: z.string().optional(),
    batchNumber: z.string().min(1, "Batch number required (REACH)"),
    needleSize: z.string().optional(),
    healthData: z.string().transform((str, ctx) => {
        try {
            return JSON.parse(str)
        } catch (e) {
            ctx.addIssue({ code: 'custom', message: 'Invalid JSON for health data' })
            return z.NEVER
        }
    })
})

export async function createProcedure(formData: FormData) {
    const supabase = await createClient()

    // 1. Authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Validation
    const rawData = {
        clientName: formData.get('clientName'),
        personalCode: formData.get('personalCode'),
        birthDate: formData.get('birthDate'),
        procedureType: formData.get('procedureType'),
        pigment: formData.get('pigment'),
        shade: formData.get('shade'),
        batchNumber: formData.get('batchNumber'),
        needleSize: formData.get('needleSize'),
        healthData: formData.get('healthData')
    }

    const validation = procedureSchema.safeParse(rawData)

    if (!validation.success) {
        return { error: 'Validation failed: ' + validation.error.issues.map(i => i.message).join(', ') }
    }

    const data = validation.data

    // 3. Age Verification
    const dob = new Date(data.birthDate)
    const ageDiffMs = Date.now() - dob.getTime()
    const ageDate = new Date(ageDiffMs)
    const age = Math.abs(ageDate.getUTCFullYear() - 1970)

    if (age < 18) {
        return { error: 'Client must be at least 18 years old.' }
    }

    // 4. Hash Personal Code (Deterministic for Lookup)
    const normalizedPersonalCode = data.personalCode.trim().toUpperCase()
    const lookupHash = crypto.createHash('sha256').update(normalizedPersonalCode).digest('hex')

    // 5. Find or Create Client
    let clientId
    const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('personal_code_hash', lookupHash)
        .single()

    if (existingClient) {
        clientId = existingClient.id
    } else {
        const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
                full_name: data.clientName,
                personal_code_hash: lookupHash,
                birth_date: data.birthDate
            })
            .select()
            .single()

        if (clientError) return { error: 'Failed to register client: ' + clientError.message }
        clientId = newClient.id
    }

    // 6. Insert into Procedures
    const { data: procedure, error: insertError } = await supabase
        .from('procedures')
        .insert({
            master_id: user.id,
            client_id: clientId,
            type: data.procedureType,
            pigment_batch_number: data.batchNumber,
            status: 'completed',
            client_name: data.clientName,
            client_personal_code_hash: lookupHash, // Store hash in procedure for redundancy/view
            birth_date: data.birthDate,
            health_data: data.healthData
        })
        .select()
        .single()

    if (insertError) {
        return { error: insertError.message }
    }

    // 7. Non-Repudiation Logging & File Handling
    const headerList = await headers()
    const ip = headerList.get('x-forwarded-for') || 'unknown'
    const userAgent = headerList.get('user-agent') || 'unknown'

    // Hash the content
    const contentHash = crypto.createHash('sha256')
        .update(JSON.stringify({ ...data, master_id: user.id, client_id: clientId }))
        .digest('hex')

    const supabaseAdmin = createAdminClient()

    // 8. Handle PDF Upload & Waiver Creation
    const pdfFile = formData.get('waiverFile') as File
    if (!pdfFile) return { error: 'Waiver PDF file is required' }

    const filePath = `waivers/${user.id}/${procedure.id}_${Date.now()}.pdf`

    // Upload using Admin Client
    const { error: uploadError } = await supabaseAdmin
        .storage
        .from('legal-docs')
        .upload(filePath, pdfFile, {
            contentType: 'application/pdf',
            upsert: false
        })

    if (uploadError) return { error: 'Failed to upload waiver: ' + uploadError.message }

    // Create Waiver Record
    const { error: waiverError } = await supabaseAdmin
        .from('waivers')
        .insert({
            procedure_id: procedure.id,
            client_signature_url: filePath,
            pdf_storage_path: filePath
        })

    if (waiverError) return { error: 'Failed to create waiver record: ' + waiverError.message }

    // 9. Audit Log
    await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'PROCEDURE_COMPLETED_WITH_WAIVER',
        table_name: 'procedures',
        record_id: procedure.id,
        ip_address: ip,
        details: {
            userAgent,
            contentHash,
            event: 'legal_document_sealed',
            timestamp: new Date().toISOString()
        }
    })

    return { success: true, procedure }
}
