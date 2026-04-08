import React from "react";
import { Box, Typography, Paper, Grid, useTheme, useMediaQuery } from "@mui/material";
import { useThemeMode } from "./ThemeContext";
import CheckIcon from "@mui/icons-material/Check";

const colorPresets = [
  { name: "YouTube Red", value: "#ff0000" },
  { name: "Ocean Blue", value: "#3ea6ff" },
  { name: "Royal Purple", value: "#9d4edd" },
  { name: "Forest Green", value: "#2d6a4f" },
  { name: "Sunset Orange", value: "#ff9f1c" },
  { name: "Hot Pink", value: "#ff006e" },
  { name: "Golden Glow", value: "#ffbe0b" },
  { name: "Neon Lime", value: "#9ef01a" },
];

interface SettingsProps {
  isSidebarExpanded: boolean;
}

const Settings: React.FC<SettingsProps> = ({ isSidebarExpanded }) => {
  const theme = useTheme();
  const { primaryColor, setPrimaryColor } = useThemeMode();
  const isDark = theme.palette.mode === "dark";

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const sidebarWidthVal = isSidebarExpanded ? 242 : 104;
  const totalMarginLeft = isMobile ? 0 : sidebarWidthVal;
  const headerHeight = 88;

  return (
    <Box
      sx={{
        marginLeft: `${totalMarginLeft}px`,
        marginTop: `${headerHeight}px`,
        minHeight: `calc(100vh - ${headerHeight}px)`,
        backgroundColor: isDark ? "#0f0f0f" : "#f9f9f9",
        p: { xs: 2, md: 4 },
        transition: "margin-left 0.3s ease",
      }}
    >
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: isDark ? "#fff" : "#000" }}>
          Settings
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "16px",
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, color: isDark ? "#fff" : "#000" }}>
            Appearance & Branding
          </Typography>

          <Typography sx={{ mb: 2, color: isDark ? "#aaa" : "#666", fontSize: "0.9rem" }}>
            Select your preferred accent color for menus, buttons, and highlights across the application.
          </Typography>

          <Grid container spacing={3}>
            {colorPresets.map((color) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={color.value}>
                <Box
                  onClick={() => setPrimaryColor(color.value)}
                  sx={{
                    cursor: "pointer",
                    p: 2,
                    borderRadius: "12px",
                    border: `2px solid ${primaryColor === color.value ? primaryColor : "transparent"}`,
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    "&:hover": {
                      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: color.value,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 12px ${color.value}44`
                    }}
                  >
                    {primaryColor === color.value && <CheckIcon sx={{ color: "#fff" }} />}
                  </Box>
                  <Typography variant="caption" sx={{ color: isDark ? "#fff" : "#000", fontWeight: primaryColor === color.value ? 600 : 400 }}>
                    {color.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box sx={{ mt: 4, p: 2, borderRadius: "12px", backgroundColor: `${primaryColor}11`, border: `1px dashed ${primaryColor}` }}>
          <Typography sx={{ color: primaryColor, fontSize: "0.85rem", textAlign: "center" }}>
            Branding color synced with your local profile.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
