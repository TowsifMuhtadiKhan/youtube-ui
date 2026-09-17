import type { ReactNode } from 'react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { useThemeMode } from './ThemeContext';

const makeKidsTheme = (dark: boolean) => createTheme({
  palette: {
    mode: dark ? 'dark' : 'light',
    primary: { main: dark ? '#e47764' : '#bb2d40', contrastText: dark ? '#0b132b' : '#ffffff' },
    secondary: { main: dark ? '#e47764' : '#842442' },
    background: { default: dark ? '#0b132b' : '#fff8f6', paper: dark ? '#131d36' : '#ffffff' },
    text: { primary: dark ? '#f5f5f5' : '#0b132b', secondary: dark ? '#bdbdbd' : '#655960' },
    divider: dark ? '#2b344b' : '#eededb',
    success: { main: dark ? '#8ed8bd' : '#287968' },
  },
  typography: {
    fontFamily: "'Outfit', 'Segoe UI', sans-serif",
    allVariants: { color: dark ? '#f5f5f5' : '#0b132b' },
    h1: { fontWeight: 900 }, h5: { fontWeight: 800 }, h6: { fontWeight: 800 },
    button: { fontWeight: 800, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { styleOverrides: { root: { minHeight: 44, borderRadius: 10, paddingInline: 16 }, contained: { boxShadow: 'none' } } },
    MuiCard: { styleOverrides: { root: { border: `1px solid ${dark ? '#2b344b' : '#eededb'}`, boxShadow: 'none' } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: 14, minHeight: 42, borderRadius: 10, marginRight: 8, color: dark ? '#bdbdbd' : '#655960', '&.Mui-selected': { backgroundColor: dark ? '#442335' : '#f8e2df', color: dark ? '#f19a8b' : '#bb2d40' } } } },
    MuiTabs: { styleOverrides: { indicator: { display: 'none' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 800 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24 } } },
  },
});
const themes = { light: makeKidsTheme(false), dark: makeKidsTheme(true) };

export default function KidsTheme({ children }: { children: ReactNode }) {
  const parentTheme = useTheme();
  const { colorMode } = useThemeMode();
  const kids = useLocation().pathname.startsWith('/kids');
  return <ThemeProvider theme={kids ? themes[colorMode] : parentTheme}>{children}</ThemeProvider>;
}
