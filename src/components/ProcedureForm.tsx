'use client'

import React, { useState } from 'react'
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Stack,
    MenuItem,
    Stepper,
    Step,
    StepLabel,
    Alert,
    CircularProgress
} from '@mui/material'
import SignaturePad from './SignaturePad'
import { generateWaiverPDF } from '@/utils/pdfGenerator'
import { uploadWaiver } from '@/utils/storage'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const steps = ['Technical Details', 'Client Waiver', 'Finalize']

export default function ProcedureForm() {
    const [activeStep, setActiveStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        procedureType: 'Eyebrows',
        pigment: '',
        shade: '',
        batchNumber: '',
        needleSize: '',
        clientName: ''
    })

    const [signature, setSignature] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleNext = () => setActiveStep((prev) => prev + 1)
    const handleBack = () => setActiveStep((prev) => prev - 1)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSignatureSave = (dataUrl: string) => {
        setSignature(dataUrl)
        handleNext()
    }

    const handleSubmit = async () => {
        if (!signature) return
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // 1. Generate PDF
            const pdfBlob = generateWaiverPDF({
                clientName: formData.clientName,
                procedureType: formData.procedureType,
                pigment: formData.pigment,
                batchNumber: formData.batchNumber,
                signatureDataUrl: signature
            })

            // 2. Create Procedure Record
            const { data: procedure, error: procError } = await supabase
                .from('procedures')
                .insert({
                    master_id: user.id,
                    client_id: user.id, // For MVP self-signing or need to select client. using self for now.
                    type: formData.procedureType,
                    pigment_batch_number: formData.batchNumber,
                    status: 'completed'
                })
                .select()
                .single()

            if (procError) throw procError

            // 3. Upload Waiver
            const path = await uploadWaiver(pdfBlob, user.id, procedure.id)

            // 4. Create Waiver Record
            const { error: waiverError } = await supabase
                .from('waivers')
                .insert({
                    procedure_id: procedure.id,
                    client_signature_url: path, // Storing path to PDF in storage (conceptually)
                    pdf_storage_path: path
                })

            if (waiverError) throw waiverError

            router.push('/dashboard?success=Procedure saved')

        } catch (err: any) {
            setError(err.message || 'Failed to complete procedure')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                New Procedure
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {activeStep === 0 && (
                <Paper sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <TextField
                            select
                            label="Procedure Type"
                            name="procedureType"
                            value={formData.procedureType}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="Eyebrows">Eyebrows (PMU)</MenuItem>
                            <MenuItem value="Lips">Lips</MenuItem>
                            <MenuItem value="Eyeliner">Eyeliner</MenuItem>
                            <MenuItem value="Tattoo">Tattoo Body Art</MenuItem>
                        </TextField>

                        <TextField
                            label="Client Full Name"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Pigment Brand/Name"
                                name="pigment"
                                value={formData.pigment}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                label="Shade"
                                name="shade"
                                value={formData.shade}
                                onChange={handleChange}
                            />
                        </Box>

                        <TextField
                            label="Batch Number (REACH)"
                            name="batchNumber"
                            value={formData.batchNumber}
                            onChange={handleChange}
                            required
                            error={!formData.batchNumber}
                            helperText="Critical for compliance"
                        />

                        <TextField
                            label="Needle Size"
                            name="needleSize"
                            value={formData.needleSize}
                            onChange={handleChange}
                        />

                        <Button variant="contained" onClick={handleNext}>
                            Next: Client Waiver
                        </Button>
                    </Stack>
                </Paper>
            )}

            {activeStep === 1 && (
                <Box>
                    <SignaturePad onSave={handleSignatureSave} />
                    <Button onClick={handleBack} sx={{ mt: 2 }}>Back</Button>
                </Box>
            )}

            {activeStep === 2 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Ready to Finalize?
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        This will generate the legal PDF, upload it, and record the procedure.
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button onClick={handleBack} disabled={loading}>
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} color="inherit" />}
                        >
                            {loading ? 'Processing...' : 'Complete & Save'}
                        </Button>
                    </Box>
                </Paper>
            )}
        </Container>
    )
}
