'use client'

import React, { useState } from 'react'
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Stack,
    Alert,
    Divider
} from '@mui/material'
import { createMaster } from './actions'

export default function MastersPage() {
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setSuccess(null)

        const formData = new FormData(event.currentTarget)
        const result = await createMaster(formData)

        if (result.error) {
            setError(result.error)
        } else {
            setSuccess(result.message!)
            // Reset form
            event.currentTarget.reset()
        }
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Manage Masters
            </Typography>

            <Paper sx={{ p: 4, maxWidth: 600 }}>
                <Typography variant="h6" gutterBottom>
                    Create New Master
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                    <TextField
                        name="fullName"
                        label="Full Name"
                        required
                        fullWidth
                    />
                    <TextField
                        name="salonName"
                        label="Salon Name"
                        required
                        fullWidth
                    />
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        required
                        fullWidth
                    />
                    <Button type="submit" variant="contained" size="large">
                        Send Invitation & Create Master
                    </Button>
                </Stack>
            </Paper>
        </Box>
    )
}
