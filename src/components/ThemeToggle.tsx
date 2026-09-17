import { IconButton, Tooltip } from '@mui/material';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import { useThemeMode } from './ThemeContext';

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useThemeMode();
  const label = colorMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  return <Tooltip title={label}><IconButton aria-label={label} onClick={toggleColorMode} sx={{ width: 44, height: 44, color: 'primary.main', bgcolor: 'action.hover', flexShrink: 0 }}>
    {colorMode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
  </IconButton></Tooltip>;
}
