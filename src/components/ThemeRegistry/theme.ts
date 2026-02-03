'use client';

import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#D81B60', // Rose Pink
            light: '#F06292',
            dark: '#880E4F',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#263238', // Deep Charcoal
            contrastText: '#ffffff',
        },
        background: {
            default: '#FFFAFA', // Snow white / very light blush
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
        h1: { fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em' },
        h3: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 30, // Rounded buttons for premium feel
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(216, 27, 96, 0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    borderRadius: 24,
                    border: '1px solid rgba(216, 27, 96, 0.08)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'medium',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 16,
                    },
                },
            },
        },
    },
});

export default theme;
