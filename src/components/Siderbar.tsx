import React from "react";
import {
  Box,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  Subscriptions as SubscriptionsIcon,
  VideoLibrary as VideoLibraryIcon,
  Settings as SettingsIcon,
  Android as AndroidIcon,
  Whatshot as WhatshotIcon,
  History as HistoryIcon,
  PlaylistPlay as PlaylistPlayIcon,
  WatchLater as WatchLaterIcon,
  ThumbUpAlt as ThumbUpAltIcon,
} from "@mui/icons-material";
import { useThemeMode } from "./ThemeContext";

interface SidebarProps {
  isSidebarExpanded: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarExpanded, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const { primaryColor } = useThemeMode();

  const sections = [
    { icon: <HomeIcon />, label: "Home", path: "/home" },
    { icon: <WhatshotIcon />, label: "Shorts", path: "/shorts" },
    { icon: <SubscriptionsIcon />, label: "Subscriptions", path: "/subscriptions" },
    { icon: <VideoLibraryIcon />, label: "Movies", path: "/movies" },
  ];

  const moreSections = [
    { icon: <HistoryIcon />, label: "History", path: "/history" },
    { icon: <PlaylistPlayIcon />, label: "Playlist", path: "/playlist" },
    { icon: <WatchLaterIcon />, label: "Watch Later", path: "/watch-later" },
    { icon: <ThumbUpAltIcon />, label: "Liked Videos", path: "/liked-videos" },
  ];

  const lastSections = [
    { icon: <SettingsIcon />, label: "Settings", path: "/settings" },
    { icon: <AndroidIcon sx={{ color: "#3DDC84" }} />, label: "Download App", path: "https://drive.google.com/drive/folders/1g6IDpBA6GNOas-CTL9ZjOOcQUrhoc17p", external: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Header Match Style (Floating Glass)
  const glassBg = isDark ? "rgba(10,10,10,0.75)" : "rgba(255,255,255,0.75)";
  const glassBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  
  const bgActive = `${primaryColor}15`;
  const iconColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.9)";

  const renderSection = (
    items: Array<{ icon: any; label: string; path: string; external?: boolean }>,
    sectionLabel?: string
  ) => (
    <>
      {sectionLabel && isSidebarExpanded && (
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
            px: 2.5,
            pt: 2,
            pb: 1,
          }}
        >
          {sectionLabel}
        </Typography>
      )}
      {items.map((section) => {
        const active = isActive(section.path);
        const item = (
          <Box
            key={section.label}
            onClick={() => {
              if (section.external) {
                window.open(section.path, "_blank");
              } else {
                navigate(section.path);
              }
              if (isMobile && onClose) onClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: isSidebarExpanded ? "row" : "column",
              py: isSidebarExpanded ? 0.8 : 1.2,
              px: isSidebarExpanded ? 2.2 : 0.5,
              borderRadius: "14px",
              cursor: "pointer",
              backgroundColor: active ? bgActive : "transparent",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              mb: 0.4,
              mx: isSidebarExpanded ? 1.5 : 1, // Adjusted mx for better centering
              justifyContent: isSidebarExpanded ? "flex-start" : "center",
              "&:hover": {
                backgroundColor: active ? bgActive : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                transform: isSidebarExpanded ? "translateX(4px)" : "scale(1.05)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                color: active ? primaryColor : iconColor,
                minWidth: isSidebarExpanded ? "32px" : "auto",
                width: isSidebarExpanded ? "auto" : "100%",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              {React.cloneElement(section.icon, { sx: { fontSize: active ? 22 : 20 } })}
            </Box>
            {isSidebarExpanded && (
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: active ? 700 : 500,
                  color: active ? primaryColor : textColor,
                  ml: 2,
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {section.label}
              </Typography>
            )}
          </Box>
        );

        return isSidebarExpanded ? (
          item
        ) : (
          <Tooltip key={section.label} title={section.label} placement="right">
            {item}
          </Tooltip>
        );
      })}
    </>
  );

  const sidebarContent = (
    <Box
      sx={{
        width: isSidebarExpanded ? 210 : 72,
        height: "100%",
        backgroundColor: glassBg,
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
        borderRadius: "22px",
        overflowY: "auto",
        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        pt: 2.5, // Increased space before Home
        pb: 1,
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${glassBorder}`,
        boxShadow: "none",
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
    >
      {renderSection(sections)}
      <Divider sx={{ my: 1.5, mx: 3, opacity: 0.05 }} />
      {renderSection(moreSections, "Your Space")}
      <Divider sx={{ my: 1.5, mx: 3, opacity: 0.05 }} />
      {renderSection(lastSections)}

      {/* Credit Footer */}
      <Box sx={{ mt: "auto", px: isSidebarExpanded ? 3 : 1, py: 2, textAlign: "center", opacity: 0.4 }}>
        {isSidebarExpanded ? (
          <>
            <Typography sx={{ fontSize: "11px", fontWeight: 600, color: textColor, mb: 0.5 }}>
              Towsif Muhtadi Khan
            </Typography>
            <Typography sx={{ fontSize: "10px", color: textColor, opacity: 0.8 }}>
              © 2026 • v 1.0.2
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: "9px", fontWeight: 800, color: textColor }}>
            v1.0.2
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        top: 88, // Reduced from 92
        bottom: 12, // Reduced from 16
        left: 16,
        zIndex: 1100,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        display: isMobile && !isSidebarExpanded ? "none" : "block"
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default Sidebar;
