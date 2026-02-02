'use client'

import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Box, Button, Typography, Paper, Alert } from '@mui/material'

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void
    disabled?: boolean
}

export default function SignaturePad({ onSave, disabled = false }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isEmpty, setIsEmpty] = useState(true)
    const [canvasWidth, setCanvasWidth] = useState(500)

    // Handle responsive resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setCanvasWidth(containerRef.current.offsetWidth - 34) // padding adjust
            }
        }

        // Initial size
        handleResize()

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const clear = () => {
        sigCanvas.current?.clear()
        setIsEmpty(true)
    }

    const handleEndDrawing = () => {
        if (sigCanvas.current) {
            setIsEmpty(sigCanvas.current.isEmpty())
        }
    }

    const handleSave = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
            onSave(dataUrl)
        }
    }

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Client Signature
            </Typography>

            <Box
                ref={containerRef}
                sx={{
                    border: '1px dashed #ccc',
                    borderRadius: 1,
                    bgcolor: '#fafafa',
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        width: canvasWidth,
                        height: 200,
                        className: 'sigCanvas'
                    }}
                    onEnd={handleEndDrawing}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={clear}
                    disabled={disabled}
                >
                    Clear
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={isEmpty || disabled}
                >
                    Confirm Signature
                </Button>
            </Box>
        </Paper>
    )
}
