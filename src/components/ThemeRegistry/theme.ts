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
            main: '#e5d0ff', // Soft Lavender
            light: '#f3eaff',
            dark: '#9575cd', // Deepened lavender for text
            contrastText: '#2d1b4d', // Deep purple-black for contrast
        },
        secondary: {
            main: '#263238', // Deep Charcoal
            light: '#455a64',
            contrastText: '#ffffff',
        },
        error: {
            main: '#ffab91', // Muted coral instead of bright red
        },
        success: {
            main: '#b2dfdb', // Muted mint instead of bright green
        },
        background: {
            default: '#fbfaff', // Softest lavender mist
            paper: '#ffffff',
        },
        text: {
            primary: '#2d1b4d',
            secondary: '#5c4b7a',
        },
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
        h1: { fontWeight: 700, letterSpacing: '-0.02em', color: '#2d1b4d' },
        h2: { fontWeight: 700, letterSpacing: '-0.01em', color: '#2d1b4d' },
        h3: { fontWeight: 600, color: '#2d1b4d' },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 30,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 8px 24px rgba(229, 208, 255, 0.4)',
                        transform: 'translateY(-2px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#e5d0ff',
                    color: '#2d1b4d',
                    '&:hover': {
                        backgroundColor: '#dcc1ff',
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
                    border: '1px solid rgba(149, 117, 205, 0.12)', // Subtle lavender border
                    boxShadow: '0 12px 40px rgba(45, 27, 77, 0.03)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 20px 48px rgba(45, 27, 77, 0.05)',
                    },
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
                        transition: 'all 0.2s ease',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e5d0ff',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                            borderColor: '#b39ddb',
                        },
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    color: '#2d1b4d',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(149, 117, 205, 0.08)',
                },
            },
        },
    },
});

export default theme;
