'use client'

import React from 'react'
import { Box, Button, Container, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import Link from 'next/link'
import AddIcon from '@mui/icons-material/Add'
import dayjs from 'dayjs'

interface ProceduresTableProps {
    procedures: any[]
}

export default function ProceduresTable({ procedures }: ProceduresTableProps) {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Procedures Done
                </Typography>
                <Button
                    component={Link}
                    href="/procedures/new"
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    New Procedure
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table sx={{ minWidth: 650 }} aria-label="procedures table">
                    <TableHead sx={{ bgcolor: 'secondary.light' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Client Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Batch Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {procedures && procedures.length > 0 ? (
                            procedures.map((proc: any) => (
                                <TableRow
                                    key={proc.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {dayjs(proc.created_at).format('DD MMM YYYY, HH:mm')}
                                    </TableCell>
                                    <TableCell>{proc.client_name}</TableCell>
                                    <TableCell>{proc.type}</TableCell>
                                    <TableCell>{proc.pigment_batch_number || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={proc.status}
                                            color={proc.status === 'completed' ? 'success' : 'default'}
                                            size="small"
                                            variant="outlined"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No procedures recorded yet.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    )
}
