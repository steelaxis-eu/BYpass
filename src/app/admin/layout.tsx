'use client'

import React from 'react'
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material'
import Link from 'next/link'

const drawerWidth = 240

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        BeautyPass Admin
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/admin/masters">
                                <ListItemText primary="Masters" />
                            </ListItemButton>
                        </ListItem>
                        {/* Add more admin links here */}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    )
}
