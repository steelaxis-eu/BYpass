'use client'

import { Typography, Box, Paper, Button } from '@mui/material'
import Link from 'next/link'

export default function MasterDashboard() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Master Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Welcome back. Manage your appointments and compliance documents here.
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 500 }}>
                    <Paper sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            Start New Procedure
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create a new record, technical card, and liability waiver.
                        </Typography>
                        <Button
                            component={Link}
                            href="/procedures/new"
                            variant="contained"
                            size="large"
                        >
                            New Session
                        </Button>
                    </Paper>
                </Box>

                <Box sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 500 }}>
                    <Paper sx={{ p: 4, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activity
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No recent procedures found.
                        </Typography>
                        {/* Future: List procedures here */}
                    </Paper>
                </Box>
            </Box>
        </Box>
    )
}
