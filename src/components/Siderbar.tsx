import React, { type JSX } from "react";
import {
  Box,
  Divider,
  Drawer,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
  Avatar,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  Subscriptions as SubscriptionsIcon,
  VideoLibrary as VideoLibraryIcon,
  History as HistoryIcon,
  PlaylistPlay as PlaylistPlayIcon,
  WatchLater as WatchLaterIcon,
  ThumbUpAlt as ThumbUpAltIcon,
  TrendingUp as TrendingUpIcon,
  MusicNote as MusicNoteIcon,
  SportsEsports as SportsEsportsIcon,
  SportsBaseball as SportsBaseballIcon,
  Settings as SettingsIcon,
  Feedback as FeedbackIcon,
  Android as AndroidIcon,
} from "@mui/icons-material";

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

  const sections = [
    { icon: <HomeIcon />, label: "Home", path: "/home" },
    { icon: <VideoLibraryIcon />, label: "Movies", path: "/movies" },
    { icon: <SubscriptionsIcon />, label: "Subscriptions", path: "/subscriptions" },
  ];

  const moreSections = [
    { icon: <HistoryIcon />, label: "History", path: "/history" },
    { icon: <PlaylistPlayIcon />, label: "Playlist", path: "/playlist" },
    { icon: <WatchLaterIcon />, label: "Watch Later", path: "/watch-later" },
    { icon: <ThumbUpAltIcon />, label: "Liked Videos", path: "/liked-videos" },
  ];

  const trendingSections = [
    { icon: <TrendingUpIcon />, label: "Trending", path: "/trending" },
    { icon: <MusicNoteIcon />, label: "Music", path: "/music" },
    { icon: <SportsEsportsIcon />, label: "Gaming", path: "/gaming" },
    { icon: <SportsBaseballIcon />, label: "Sports", path: "/sports" },
  ];

  const lastSections = [
    { icon: <SettingsIcon />, label: "Settings", path: "/settings" },
    { icon: <FeedbackIcon />, label: "Feedback", path: "/feedback" },
    { icon: <AndroidIcon sx={{ color: "#3DDC84" }} />, label: "Download App", path: "https://drive.google.com/drive/folders/1g6IDpBA6GNOas-CTL9ZjOOcQUrhoc17p", external: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  const bgActive = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  const bgHover = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const iconColor = isDark ? "#f1f1f1" : "#0f0f0f";
  const iconActiveColor = isDark ? "#ffffff" : "#000000";
  const textColor = isDark ? "#f1f1f1" : "#0f0f0f";
  const textActiveColor = isDark ? "#ffffff" : "#000000";

  const renderSection = (
    items: Array<{ icon: JSX.Element; label: string; path: string; external?: boolean }>,
    sectionLabel?: string
  ) => (
    <>
      {sectionLabel && isSidebarExpanded && (
        <Typography
          sx={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
            px: 1.5,
            pt: 1,
            pb: 0.5,
          }}
        >
          {sectionLabel}
        </Typography>
      )}
      {items.map((section) => {
        const active = isActive(section.path);
        const item = (
          <Box
            key={section.path}
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
              gap: isSidebarExpanded ? 1.5 : 0,
              justifyContent: isSidebarExpanded ? "flex-start" : "center",
              px: isSidebarExpanded ? 1.5 : 0,
              py: 0.85,
              borderRadius: "10px",
              mb: 0.25,
              cursor: "pointer",
              backgroundColor: active ? bgActive : "transparent",
              transition: "all 0.15s ease",
              "&:hover": {
                backgroundColor: active ? bgActive : bgHover,
              },
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Active indicator strip */}
            {active && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: "20%",
                  height: "60%",
                  width: 3,
                  backgroundColor: "#ff0000",
                  borderRadius: "0 2px 2px 0",
                }}
              />
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                ml: active && isSidebarExpanded ? 0 : 0,
              }}
            >
              {React.cloneElement(section.icon, {
                sx: {
                  fontSize: "22px",
                  color: active ? iconActiveColor : iconColor,
                  opacity: active ? 1 : 0.75,
                },
              })}
            </Box>
            {isSidebarExpanded && (
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  color: active ? textActiveColor : textColor,
                  opacity: active ? 1 : 0.75,
                  lineHeight: 1,
                }}
              >
                {section.label}
              </Typography>
            )}
          </Box>
        );

        return !isSidebarExpanded ? (
          <Tooltip key={section.path} title={section.label} placement="right">
            {item}
          </Tooltip>
        ) : (
          item
        );
      })}
    </>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isSidebarExpanded}
      onClose={onClose}
      sx={{
        width: isSidebarExpanded ? 200 : 72,
        flexShrink: 0,
        zIndex: theme.zIndex.drawer + 2,
        "& .MuiDrawer-paper": {
          width: isSidebarExpanded ? 200 : 72,
          boxSizing: "border-box",
          backgroundColor: isDark ? "rgba(8,8,8,0.7)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(20px)",
          border: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "hidden",
          height: isMobile ? "calc(100vh - 68px)" : "calc(100vh - 92px)",
          top: isMobile ? 68 : 92,
          ...(!isMobile && {
            left: 16,
            borderRadius: "24px",
            boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "none",
            border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
          }),
        },
      }}
    >
      <Box sx={{ overflow: "auto", height: "100%", pt: !isMobile ? 2 : 8, px: 1.5 }}>
        {/* User Profile Section */}


        {renderSection(sections)}
        <Divider sx={{ my: 2, mx: 1.5, opacity: 0.1 }} />
        {renderSection(moreSections, "Your Library")}
        <Divider sx={{ my: 2, mx: 1.5, opacity: 0.1 }} />
        {renderSection(trendingSections, "Explore")}
        <Divider sx={{ my: 2, mx: 1.5, opacity: 0.1 }} />
        {renderSection(lastSections)}

        {isSidebarExpanded && (
          <Box sx={{ px: 2, pb: 4, mt: 4 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5, display: "block", mb: 1 }}>
              © 2026 Towsif Muhtadi Khan
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>
              v1.0.1
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
