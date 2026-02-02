'use client'

import React, { Suspense } from 'react'
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Stack,
    Alert,
    CircularProgress
} from '@mui/material'
import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const [error, setError] = React.useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        const formData = new FormData(event.currentTarget)
        // Cast to SubmitEvent to access submitter
        const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('name')

        let result
        if (action === 'signup') {
            result = await signup(formData)
        } else {
            result = await login(formData)
        }

        if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
                        BeautyPass
                    </Typography>
                    <Typography color="text.secondary">
                        Sign in or create a Client account
                    </Typography>
                </Box>

                {message && <Alert severity="info">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    fullWidth
                    required
                    autoComplete="email"
                />

                <TextField
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    autoComplete="current-password"
                />

                <Button
                    type="submit"
                    name="login"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Sign In
                </Button>

                <Button
                    type="submit"
                    name="signup"
                    variant="outlined"
                    fullWidth
                >
                    Create Client Account
                </Button>
            </Stack>
        </Paper>
    )
}

export default function LoginPage() {
    return (
        <Container maxWidth="sm" sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center' }}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}><CircularProgress /></Box>}>
                <LoginForm />
            </Suspense>
        </Container>
    )
}
