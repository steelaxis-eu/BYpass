'use client'

import React, { useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import ManualSignature from './ManualSignature'
import SmartIDSignature from './SmartIDSignature'
import DrawIcon from '@mui/icons-material/Draw'
import SmartphoneIcon from '@mui/icons-material/Smartphone'

interface SignatureManagerProps {
    onSave: (data: string, method: 'MANUAL' | 'SMART_ID') => void
    personalCode?: string // Pre-fill for Smart-ID
}

export default function SignatureManager({ onSave, personalCode }: SignatureManagerProps) {
    const [method, setMethod] = useState<'MANUAL' | 'SMART_ID'>('MANUAL')

    const handleMethodChange = (
        event: React.MouseEvent<HTMLElement>,
        newMethod: 'MANUAL' | 'SMART_ID' | null,
    ) => {
        if (newMethod !== null) {
            setMethod(newMethod)
        }
    }

    return (
        <Box>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="overline" display="block" gutterBottom>
                    Select Signature Method
                </Typography>
                <ToggleButtonGroup
                    value={method}
                    exclusive
                    onChange={handleMethodChange}
                    aria-label="signature method"
                    color="primary"
                >
                    <ToggleButton value="MANUAL" aria-label="manual">
                        <DrawIcon sx={{ mr: 1 }} />
                        Sign on Screen
                    </ToggleButton>
                    <ToggleButton value="SMART_ID" aria-label="smart-id">
                        <SmartphoneIcon sx={{ mr: 1 }} />
                        Smart-ID
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {method === 'MANUAL' ? (
                <ManualSignature
                    onSave={(data) => onSave(data, 'MANUAL')}
                />
            ) : (
                <SmartIDSignature
                    personalCode={personalCode}
                    onSave={(token) => onSave(token, 'SMART_ID')}
                />
            )}
        </Box>
    )
}
