'use client'

import React, { useState } from 'react'
import { Box, Button, Typography, TextField, CircularProgress, Alert } from '@mui/material'

interface SmartIDSignatureProps {
    onSave: (token: string) => void
    personalCode?: string
}

export default function SmartIDSignature({ onSave, personalCode = '' }: SmartIDSignatureProps) {
    const [status, setStatus] = useState<'idle' | 'sending' | 'waiting' | 'confirmed'>('idle')
    const [code, setCode] = useState(personalCode)

    const handleInitiate = async () => {
        setStatus('sending')
        // Simulate API call to Smart-ID
        setTimeout(() => {
            setStatus('waiting')
            // Simulate polling
            setTimeout(() => {
                setStatus('confirmed')
                onSave('SMART_ID_VERIFIED_TOKEN_MOCK')
            }, 3000)
        }, 1000)
    }

    return (
        <Box sx={{ p: 3, textAlign: 'center', border: '1px solid #eee', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
                Smart-ID Signing
            </Typography>

            {status === 'idle' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, mx: 'auto' }}>
                    <Typography variant="body2" color="text.secondary">
                        Enter Personal Code to send signing request.
                    </Typography>
                    <TextField
                        label="Personal Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        size="small"
                        disabled={!!personalCode} // Locked if passed from parent
                    />
                    <Button variant="contained" onClick={handleInitiate} disabled={!code}>
                        Send Request
                    </Button>
                </Box>
            )}

            {status === 'sending' && (
                <Box>
                    <CircularProgress size={24} sx={{ mb: 2 }} />
                    <Typography>Connecting to Smart-ID...</Typography>
                </Box>
            )}

            {status === 'waiting' && (
                <Box>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="h6">Check your phone</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Verification code: <Box component="span" fontWeight="bold">1234</Box>
                    </Typography>
                </Box>
            )}

            {status === 'confirmed' && (
                <Alert severity="success">
                    Signature Confirmed!
                </Alert>
            )}
        </Box>
    )
}
