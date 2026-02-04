import { createClient } from '@/utils/supabase/server'
import { Container, Typography } from '@mui/material'
import ProceduresTable from '@/components/ProceduresTable'

export default async function ProceduresPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h5">Please log in to view procedures.</Typography>
            </Container>
        )
    }

    const { data: procedures } = await supabase
        .from('procedures')
        .select('*')
        .eq('master_id', user.id)
        .order('created_at', { ascending: false })

    return <ProceduresTable procedures={procedures || []} />
}
