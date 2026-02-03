'use client'

import { Typography, Box, Paper, Button, Divider } from '@mui/material'
import Link from 'next/link'

export default function MasterDashboard() {
    return (
        <Box>
            <Typography
                variant="h3"
                gutterBottom
                sx={{ fontFamily: 'var(--font-playfair), serif', color: 'primary.dark', fontWeight: 700 }}
            >
                Master Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, letterSpacing: 0.5 }}>
                Welcome back to your sanctuary. Manage your appointments and compliance rituals here.
            </Typography>

            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 320, maxWidth: 450 }}>
                    <Paper sx={{
                        p: 5,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        background: 'linear-gradient(to bottom right, #ffffff, #fbfaff)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            position: 'absolute', top: -20, right: -20,
                            width: 100, height: 100, bgcolor: 'primary.light',
                            borderRadius: '50%', opacity: 0.3, filter: 'blur(30px)'
                        }} />

                        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 600 }}>
                            Start New Procedure
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                            Initiate a new ritual: record technical details, pigment choices, and secure the sacred signature.
                        </Typography>
                        <Button
                            component={Link}
                            href="/procedures/new"
                            variant="contained"
                            size="large"
                            sx={{ mt: 'auto' }}
                        >
                            New Session
                        </Button>
                    </Paper>
                </Box>

                <Box sx={{ flex: '1 1 300px', minWidth: 320, maxWidth: 450 }}>
                    <Paper sx={{ p: 5, height: '100%', bgcolor: 'background.paper' }}>
                        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'var(--font-playfair), serif', fontWeight: 600 }}>
                            Recent Activity
                        </Typography>
                        <Divider sx={{ mb: 3, borderColor: 'rgba(149, 117, 205, 0.08)' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, fontStyle: 'italic' }}>
                            No recent procedures found in the sanctuary.
                        </Typography>
                    </Paper>
                </Box>
            </Box>
        </Box>
    )
}
