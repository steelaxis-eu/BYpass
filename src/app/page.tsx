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

      <Stack direction="row" justifyContent="center" width="100%">
        <Paper sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to access your account.
          </Typography>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="large"
            fullWidth
          >
            Sign In
          </Button>
        </Paper>
      </Stack>
    </Container>
  )
}
