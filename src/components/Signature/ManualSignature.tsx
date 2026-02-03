'use client'

import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Box, Button, Typography, Paper } from '@mui/material'

interface ManualSignatureProps {
    onSave: (data: string) => void
    onCancel?: () => void
}

export default function ManualSignature({ onSave, onCancel }: ManualSignatureProps) {
    const sigCanvas = useRef<SignatureCanvas>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isEmpty, setIsEmpty] = useState(true)
    const [canvasWidth, setCanvasWidth] = useState(500)

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setCanvasWidth(containerRef.current.offsetWidth - 34)
            }
        }
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

    const handleConfirm = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
            onSave(dataUrl)
        }
    }

    return (
        <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Sign on screen below:
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
                <Button onClick={clear} disabled={isEmpty}>Clear</Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={isEmpty}
                >
                    Confirm Signature
                </Button>
            </Box>
        </Paper>
    )
}
