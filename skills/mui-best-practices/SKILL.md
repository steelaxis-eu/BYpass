---
name: mui-best-practices
description: Guidelines for using Material UI v6 with Next.js 15 App Router, including theming and SSR integration.
---

# MUI v6 + Next.js 15 Best Practices

This skill defines how to use Material UI correctly within the Next.js App Router environment to ensure clean aesthetics and high performance.

## 1. Theme Registry (SSR Support)
MUI uses emotion, which needs a registry to work with Server Components. 
Create `components/ThemeRegistry/ThemeRegistry.tsx`.

## 2. Theming (Teal/White Aesthetic)
Define a custom theme in `components/ThemeRegistry/theme.ts`.

```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#009688', // Teal
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Modern rounded corners
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 12, // Clinical, clean cards
          border: '1px solid #e0e0e0',
        },
      },
    },
  },
});

export default theme;
```

## 3. Styling Components
- **Prefer `sx` prop** for one-off styles. It's type-safe and theme-aware.
- **Use `Stack`** for layout (flexbox) instead of `div`.

```tsx
<Stack spacing={2} sx={{ p: 4, bgcolor: 'background.paper' }}>
  <Typography variant="h4" color="primary">Welcome</Typography>
</Stack>
```

## 4. Responsive Design
Use the `useMediaQuery` hook or `sx` breakpoints.

```tsx
<Box sx={{ 
  width: { xs: '100%', md: '50%' }, // 100% on mobile, 50% on desktop
  p: { xs: 2, md: 4 } 
}}>
```

## 5. Performance
- **Avoid** importing from `@mui/material`. Use direct path imports if tree-shaking fails (rare in modern builds but good to know).
- **Client vs. Server**: Most UI interactions (Dialogs, Buttons with onClick) must be `"use client"`. Keep page layouts as Server Components.
