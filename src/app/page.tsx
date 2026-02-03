'use client'

import { Box, Button, Container, Typography, Stack, Paper, Grid, Divider, useTheme } from '@mui/material'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'

const SerifTypography = ({ children, sx, ...props }: any) => (
  <Typography sx={{ fontFamily: 'var(--font-playfair), serif', ...sx }} {...props}>
    {children}
  </Typography>
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const theme = useTheme()
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
    return '/master/dashboard' // Fallback
  }

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', scrollBehavior: 'smooth' }}>
      {/* Hero Section */}
      <Box sx={{
        pt: 15, pb: 10,
        background: 'linear-gradient(135deg, #f3eaff 0%, #FFFFFF 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Artistic background blur */}
        <Box sx={{
          position: 'absolute', top: -100, right: -100,
          width: 400, height: 400, borderRadius: '50%',
          bgcolor: 'primary.light', opacity: 0.3, filter: 'blur(100px)'
        }} />

        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <SerifTypography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, color: 'primary.main', mb: -2 }}>
              BeautyPass
            </SerifTypography>
            <Typography variant="h5" color="secondary" sx={{ fontWeight: 300, letterSpacing: 2, textTransform: 'uppercase', mb: 4 }}>
              The Sanctuary of Aesthetic Compliance
            </Typography>

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {loading ? (
                <Button disabled variant="contained" size="large">Loading Sanctuary...</Button>
              ) : user ? (
                <Button component={Link} href={getDashboardPath()} variant="contained" size="large" sx={{ py: 2, px: 6 }}>
                  Enter Dashboard
                </Button>
              ) : (
                <Button component={Link} href="/login" variant="contained" size="large" sx={{ py: 2, px: 6 }}>
                  Begin the Journey
                </Button>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Why Section */}
      <Container maxWidth="lg" sx={{ py: 15 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <SerifTypography variant="h2" gutterBottom color="primary.dark">
              Why BeautyPass?
            </SerifTypography>
            <Typography variant="h6" paragraph sx={{ fontWeight: 300, lineHeight: 1.6 }}>
              In the bridge between art and science, safety is the master's ultimate signature.
              We believe that every stroke of a needle, every drop of pigment, deserves a legacy of protection.
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              We created BeautyPass to empower masters to focus on their canvas, knowing that the foundation of their business—compliance, consent, and safety—is held with untouchable precision.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{
              p: 4, bgcolor: 'primary.dark', color: 'white',
              transform: 'rotate(2deg)',
              boxShadow: '20px 20px 60px rgba(0,0,0,0.1)'
            }}>
              <SerifTypography variant="h4" gutterBottom>
                Art deserves armor.
              </SerifTypography>
              <Typography variant="body1">
                "Professionalism isn't just about the result; it's about the respect you show your client before the first touch."
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* What Section */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 15 }}>
        <Container maxWidth="lg">
          <SerifTypography variant="h2" align="center" gutterBottom sx={{ mb: 8 }}>
            The Essence of the Platform
          </SerifTypography>
          <Grid container spacing={6}>
            {[
              { title: 'Digital Waivers', desc: 'Legally robust, artistically signed. Captured in an instant.' },
              { title: 'Technical Cards', desc: 'Pigment batches, needle depths, and procedure notes in one sanctuary.' },
              { title: 'Secure Archiving', desc: 'Your clients data, protected by the same security as a bank.' },
            ].map((item, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Stack spacing={2}>
                  <Typography variant="h5" sx={{ color: 'primary.light', fontWeight: 'bold' }}>0{i + 1}</Typography>
                  <SerifTypography variant="h4">{item.title}</SerifTypography>
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>{item.desc}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How Section */}
      <Container maxWidth="lg" sx={{ py: 15 }}>
        <SerifTypography variant="h2" align="center" color="primary.main" gutterBottom sx={{ mb: 10 }}>
          The Flow of Perfection
        </SerifTypography>
        <Stack spacing={10}>
          {[
            { step: '1', title: 'Invite the Master', desc: 'Admins invite precision-oriented masters to the sanctuary.' },
            { step: '2', title: 'Create the Ritual', desc: 'Masters start a new procedure, documenting every pigment and needle choice.' },
            { step: '3', title: 'The Sacred Signature', desc: 'Clients review and sign digitally, creating a permanent bond of trust.' },
          ].map((item, i) => (
            <Grid container spacing={4} key={i} alignItems="center" direction={i % 2 === 0 ? 'row' : 'row-reverse'}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: '50%',
                  bgcolor: 'primary.main', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 'bold', mb: 3
                }}>
                  {item.step}
                </Box>
                <SerifTypography variant="h3" gutterBottom>{item.title}</SerifTypography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>{item.desc}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ height: 200, bgcolor: 'primary.light', opacity: 0.1, borderRadius: 10 }} />
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Container>

      {/* Footer / CTA */}
      <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'primary.dark', color: 'white' }}>
        <SerifTypography variant="h3" gutterBottom>
          Ready to elevate your practice?
        </SerifTypography>
        <Button component={Link} href="/login" variant="contained" color="inherit" sx={{ color: 'primary.dark', mt: 4, py: 2, px: 8 }}>
          Enter BeautyPass
        </Button>
        <Typography variant="body2" sx={{ mt: 8, opacity: 0.5 }}>
          © 2026 BeautyPass. Craftsmanship. Safety. Legacy.
        </Typography>
      </Box>
    </Box>
  )
}
