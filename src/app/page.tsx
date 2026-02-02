'use client'

import { Box, Button, Container, Typography, Stack, Paper } from '@mui/material'
import Link from 'next/link'

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" color="primary">
          BeautyPass
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Compliance & Booking for Beauty Professionals
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} width="100%" justifyContent="center">
        <Paper sx={{ p: 4, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            For Clients
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign waivers and manage your profile.
          </Typography>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="large"
            fullWidth
          >
            Client Sign In
          </Button>
        </Paper>

        <Paper sx={{ p: 4, flex: 1, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            For Masters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage procedures and compliance.
          </Typography>
          <Button
            component={Link}
            href="/admin"
            variant="outlined"
            size="large"
            fullWidth
          >
            Admin Dashboard
          </Button>
        </Paper>
      </Stack>
    </Container>
  )
}
