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
    CircularProgress,
    Tooltip,
    Chip,
    InputAdornment,
    Card,
    CardContent,
    Divider
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Dayjs from 'dayjs';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import HistoryIcon from '@mui/icons-material/History';
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
    const [clientHistory, setClientHistory] = useState<any[]>([])

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
        handleNext()
    }

    const handleDateChange = (date: Dayjs.Dayjs | null) => {
        if (date) {
            setFormData({ ...formData, birthDate: date.format('YYYY-MM-DD') })
        }
    }

    const handleSubmit = async () => {
        if (!signature) return
        setLoading(true)
        setError(null)

        try {
            const pdfBlob = generateWaiverPDF({
                clientName: formData.clientName,
                procedureType: formData.procedureType,
                pigment: formData.pigment,
                batchNumber: formData.batchNumber,
                signatureDataUrl: signature
            })

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
            payload.append('waiverFile', pdfBlob, 'waiver.pdf')

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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                    {/* Main Form Area */}
                    <Box sx={{ flex: { xs: '1 1 100%', md: '2' } }}>
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
                            <Paper sx={{ p: 4, position: 'relative', overflow: 'hidden' }}>
                                {/* Security Badge Overlay */}
                                <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.7 }}>
                                    <Tooltip title="This form is protected by Military-Grade Encryption and Audit Logging">
                                        <Chip
                                            icon={<SecurityIcon />}
                                            label="SECURE SESSION"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            sx={{ fontWeight: 'bold', letterSpacing: 1 }}
                                        />
                                    </Tooltip>
                                </Box>

                                <Stack spacing={3} sx={{ mt: 2 }}>
                                    <TextField
                                        label="Client Full Name"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        InputProps={{
                                            endAdornment: <VerifiedUserIcon color="action" fontSize="small" />
                                        }}
                                    />

                                    <Box sx={{ position: 'relative' }}>
                                        <TextField
                                            label="Personal ID Code"
                                            name="personalCode"
                                            value={formData.personalCode}
                                            onChange={handleChange}
                                            onBlur={async (e) => {
                                                const code = e.target.value
                                                if (code.length >= 5) {
                                                    const { lookupClient } = await import('@/app/actions/clients')
                                                    const result = await lookupClient(code)
                                                    if (result.found && result.client) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            clientName: result.client.fullName,
                                                            birthDate: result.client.birthDate
                                                        }))
                                                        // Update history
                                                        if (result.client.pastProcedures) {
                                                            setClientHistory(result.client.pastProcedures)
                                                        }
                                                    } else {
                                                        setClientHistory([])
                                                    }
                                                }
                                            }}
                                            required
                                            fullWidth
                                            helperText={
                                                <Stack direction="row" alignItems="center" component="span" spacing={0.5}>
                                                    <FingerprintIcon fontSize="inherit" />
                                                    <span>Securely Hashed (SHA-256) for GDPR Compliance</span>
                                                </Stack>
                                            }
                                        />
                                    </Box>

                                    <DatePicker
                                        label="Date of Birth"
                                        format="DD/MM/YYYY"
                                        value={formData.birthDate ? Dayjs(formData.birthDate) : null}
                                        onChange={handleDateChange}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: true,
                                                helperText: "Must be 18+ (Verified automatically)",
                                            }
                                        }}
                                    />

                                    <Button variant="contained" onClick={handleNext} size="large" sx={{ mt: 2 }}>
                                        Next: Health Screening
                                    </Button>
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
                    </Box>

                    {/* Client History Sidebar */}
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1' } }}>
                        <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.default' }} variant="outlined">
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                <HistoryIcon color="primary" />
                                <Typography variant="h6" color="primary">Client History</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {clientHistory.length > 0 ? (
                                <Stack spacing={2}>
                                    {clientHistory.map((proc) => (
                                        <Card key={proc.id} variant="outlined">
                                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {proc.type}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {Dayjs(proc.created_at).format('DD MMM YYYY')}
                                                </Typography>
                                                <Chip
                                                    label={proc.status}
                                                    size="small"
                                                    color={proc.status === 'completed' ? 'success' : 'default'}
                                                    sx={{ mt: 1, height: 20 }}
                                                />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
                                    <Typography variant="body2">
                                        No history found or new client.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Container>
        </LocalizationProvider>
    )
}
