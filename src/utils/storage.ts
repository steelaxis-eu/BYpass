import { createClient } from '@/utils/supabase/client'

export const uploadWaiver = async (pdfBlob: Blob, userId: string, procedureId: string) => {
    const supabase = createClient()
    const filePath = `waivers/${userId}/${procedureId}_${Date.now()}.pdf`

    const { data, error } = await supabase
        .storage
        .from('legal-docs')
        .upload(filePath, pdfBlob, {
            contentType: 'application/pdf',
            upsert: false
        })

    if (error) {
        console.error('Upload Error:', error)
        throw error
    }

    return data.path
}
