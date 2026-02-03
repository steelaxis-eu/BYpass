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
            <Typography
                variant="h3"
                gutterBottom
                sx={{ fontFamily: 'var(--font-playfair), serif', color: 'primary.dark', fontWeight: 700 }}
            >
                Manage Masters
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, letterSpacing: 0.5 }}>
                Invite and curate the precision-oriented experts of your sanctuary.
            </Typography>

            <Paper sx={{
                p: 5,
                maxWidth: 600,
                background: 'linear-gradient(to bottom right, #ffffff, #fbfaff)',
            }}>
                <Typography variant="h5" gutterBottom sx={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 600 }}>
                    Create New Master
                </Typography>
                <Divider sx={{ mb: 4, borderColor: 'rgba(149, 117, 205, 0.08)' }} />

                {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Stack component="form" spacing={3} onSubmit={handleSubmit}>
                    <TextField
                        name="fullName"
                        label="Full Name"
                        required
                        fullWidth
                        placeholder="e.g. Elena Petrova"
                    />
                    <TextField
                        name="salonName"
                        label="Salon Name"
                        required
                        fullWidth
                        placeholder="e.g. The Ritual Art"
                    />
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        required
                        fullWidth
                        placeholder="master@example.com"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{ mt: 2 }}
                    >
                        Send Invitation & Create Master
                    </Button>
                </Stack>
            </Paper>
        </Box>
    )
}
