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
import SignatureManager from './Signature/SignatureManager'
import { generateWaiverPDF } from '@/utils/pdfGenerator'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { createProcedure } from '@/app/actions/procedures'

const steps = ['Client Details', 'Health Screening', 'Technical Details', 'Client Waiver', 'Finalize']

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
        clientName: '',
        personalCode: '',
        birthDate: '',
        healthData: {
            allergies: false,
            pregnancy: false,
            diabetes: false,
            bloodThinners: false,
            skinConditions: false,
            infectiousDiseases: false
        }
    })

    const [signature, setSignature] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleNext = () => setActiveStep((prev) => prev + 1)
    const handleBack = () => setActiveStep((prev) => prev - 1)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleHealthChange = (key: string) => {
        setFormData({
            ...formData,
            healthData: {
                ...formData.healthData,
                // @ts-ignore
                [key]: !formData.healthData[key]
            }
        })
    }

    const handleSignatureSave = (dataUrl: string, method: 'MANUAL' | 'SMART_ID') => {
        setSignature(dataUrl)
        // Ideally we would also store the method in state/DB to know *how* they signed
        handleNext()
    }

    const handleSubmit = async () => {
        if (!signature) return
        setLoading(true)
        setError(null)

        try {
            // 1. Generate PDF Client-Side
            // Ideally we would do this server-side too, but jsPDF is client-heavy.
            // We generate the blob here and send it to the server.
            const pdfBlob = generateWaiverPDF({
                clientName: formData.clientName,
                procedureType: formData.procedureType,
                pigment: formData.pigment,
                batchNumber: formData.batchNumber,
                signatureDataUrl: signature
            })

            // 2. Prepare Data for Server Action
            const payload = new FormData()
            payload.append('clientName', formData.clientName)
            payload.append('personalCode', formData.personalCode)
            payload.append('birthDate', formData.birthDate)
            payload.append('procedureType', formData.procedureType)
            payload.append('pigment', formData.pigment)
            payload.append('shade', formData.shade)
            payload.append('batchNumber', formData.batchNumber)
            payload.append('needleSize', formData.needleSize)
            payload.append('healthData', JSON.stringify(formData.healthData))

            // Append the PDF file
            payload.append('waiverFile', pdfBlob, 'waiver.pdf')

            // 3. Call Server Action (Handles DB, Upload, Audit)
            const result = await createProcedure(payload)

            if (result.error || !result.procedure) {
                throw new Error(result.error || 'Procedure creation failed')
            }

            router.push('/master/dashboard?success=Procedure saved')

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
                            label="Client Full Name"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Personal ID Code"
                            name="personalCode"
                            value={formData.personalCode}
                            onChange={handleChange}
                            required
                            fullWidth
                            helperText="Will be securely hashed (GDPR)"
                        />
                        <TextField
                            label="Date of Birth"
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            helperText="Must be 18+"
                        />
                        <Button variant="contained" onClick={handleNext}>Next: Health Screening</Button>
                    </Stack>
                </Paper>
            )}

            {activeStep === 1 && (
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" gutterBottom color="error">Health Contraindications</Typography>
                    <Typography paragraph variant="body2">Please check if any of the following apply (Mandatory):</Typography>
                    <Stack spacing={2}>
                        {Object.entries(formData.healthData).map(([key, value]) => (
                            <Button
                                key={key}
                                variant={value ? "contained" : "outlined"}
                                color={value ? "error" : "primary"}
                                onClick={() => handleHealthChange(key)}
                                sx={{ justifyContent: 'flex-start', textTransform: 'capitalize' }}
                            >
                                {value ? "[X] " : "[ ] "} {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Button>
                        ))}
                        <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
                            <Button onClick={handleBack}>Back</Button>
                            <Button variant="contained" onClick={handleNext}>Next: Technical Details</Button>
                        </Box>
                    </Stack>
                </Paper>
            )}

            {activeStep === 2 && (
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

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button onClick={handleBack}>Back</Button>
                            <Button variant="contained" onClick={handleNext}>
                                Next: Client Waiver
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            )}

            {activeStep === 3 && (
                <Box>
                    <SignatureManager
                        onSave={handleSignatureSave}
                        personalCode={formData.personalCode}
                    />
                    <Button onClick={handleBack} sx={{ mt: 2 }}>Back</Button>
                </Box>
            )}

            {activeStep === 4 && (
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
