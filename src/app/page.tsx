'use client'

import { Box, Button, Container, Typography, Stack, Paper } from '@mui/material'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getSession() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single()
        setRole(profile?.role || 'client')
      }
      setLoading(false)
    }
    getSession()
  }, [])

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/masters'
    if (role === 'master') return '/master/dashboard'
    return '/'
  }

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
            {user ? `Logged in as ${user.email}` : 'Sign in to access your account.'}
          </Typography>

          {loading ? (
            <Button disabled variant="contained" size="large" fullWidth>Loading...</Button>
          ) : user ? (
            <Button
              component={Link}
              href={getDashboardPath()}
              variant="contained"
              size="large"
              fullWidth
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              component={Link}
              href="/login"
              variant="contained"
              size="large"
              fullWidth
            >
              Sign In
            </Button>
          )}
        </Paper>
      </Stack>
    </Container>
  )
}
