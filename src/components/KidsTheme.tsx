import type { ReactNode } from 'react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { useThemeMode } from './ThemeContext';

const makeKidsTheme = (dark: boolean) => createTheme({
  palette: {
    mode: dark ? 'dark' : 'light',
    primary: { main: dark ? '#FFD166' : '#FF6B6B', contrastText: dark ? '#0f1923' : '#ffffff' },
    secondary: { main: dark ? '#06D6A0' : '#4ECDC4' },
    background: {
      default: dark ? '#0f1923' : '#FFF5E1',
      paper: dark ? '#182633' : '#ffffff',
    },
    text: {
      primary: dark ? '#f8f8f8' : '#2d1b4e',
      secondary: dark ? '#9cb3c9' : '#7a6892',
    },
    divider: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    success: { main: dark ? '#06D6A0' : '#2ec4b6' },
    warning: { main: '#FFD166' },
    error: { main: '#FF6B6B' },
    info: { main: '#118AB2' },
  },
  typography: {
    fontFamily: "'Nunito', 'Outfit', 'Segoe UI', sans-serif",
    allVariants: { color: dark ? '#f8f8f8' : '#2d1b4e' },
    h1: { fontWeight: 900, letterSpacing: '-0.5px' },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: { fontWeight: 800, textTransform: 'none' as const, letterSpacing: '0.3px' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 50,
          paddingInline: 24,
          fontSize: '15px',
          fontWeight: 800,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': { transform: 'scale(1.05)' },
          '&:active': { transform: 'scale(0.97)' },
        },
        contained: {
          boxShadow: dark
            ? '0 4px 20px rgba(255, 209, 102, 0.3)'
            : '0 4px 20px rgba(255, 107, 107, 0.3)',
          '&:hover': {
            boxShadow: dark
              ? '0 6px 28px rgba(255, 209, 102, 0.45)'
              : '0 6px 28px rgba(255, 107, 107, 0.45)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `2px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: dark
            ? '0 8px 32px rgba(0,0,0,0.3)'
            : '0 8px 32px rgba(0,0,0,0.06)',
          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-6px) scale(1.02)',
            boxShadow: dark
              ? '0 16px 48px rgba(255, 209, 102, 0.15)'
              : '0 16px 48px rgba(255, 107, 107, 0.12)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 700,
          fontSize: 15,
          minHeight: 44,
          borderRadius: 50,
          marginRight: 8,
          paddingInline: 20,
          color: dark ? '#9cb3c9' : '#7a6892',
          transition: 'all 0.3s ease',
          '&.Mui-selected': {
            backgroundColor: dark ? 'rgba(255, 209, 102, 0.15)' : 'rgba(255, 107, 107, 0.12)',
            color: dark ? '#FFD166' : '#FF6B6B',
            fontWeight: 800,
          },
        },
      },
    },
    MuiTabs: { styleOverrides: { indicator: { display: 'none' } } },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          borderRadius: 50,
          fontSize: '13px',
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 28 } } },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 16, fontWeight: 600 },
      },
    },
  },
});

const themes = { light: makeKidsTheme(false), dark: makeKidsTheme(true) };

export default function KidsTheme({ children }: { children: ReactNode }) {
  const parentTheme = useTheme();
  const { colorMode } = useThemeMode();
  const kids = useLocation().pathname.startsWith('/kids');
  return <ThemeProvider theme={kids ? themes[colorMode] : parentTheme}>{children}</ThemeProvider>;
}
