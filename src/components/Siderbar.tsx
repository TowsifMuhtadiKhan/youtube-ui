import React, { type JSX } from "react";
import { Box, Divider, Drawer, Typography, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate
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
} from "@mui/icons-material";

interface SidebarProps {
  isSidebarExpanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarExpanded }) => {
  const navigate = useNavigate(); // Initialize navigate

  // Define sections
  const sections = [
    {
      icon: <HomeIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Home",
      path: "/home",
    },
    {
      icon: <VideoLibraryIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Shorts",
      path: "/shorts",
    },
    {
      icon: <SubscriptionsIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Subscriptions",
      path: "/subscriptions",
    },
  ];

  const moreSections = [
    {
      icon: <HistoryIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "History",
      path: "/history",
    },
    {
      icon: <PlaylistPlayIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Playlist",
      path: "/playlist",
    },
    {
      icon: <WatchLaterIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Watch Later",
      path: "/watch-later",
    },
    {
      icon: <ThumbUpAltIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Liked Videos",
      path: "/liked-videos",
    },
  ];

  const trendingSections = [
    {
      icon: <TrendingUpIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Trending",
      path: "/trending",
    },
    {
      icon: <MusicNoteIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Music",
      path: "/music",
    },
    {
      icon: <SportsEsportsIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Gaming",
      path: "/gaming",
    },
    {
      icon: <SportsBaseballIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Sports",
      path: "/sports",
    },
  ];

  const lastSections = [
    {
      icon: <SettingsIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Settings",
      path: "/settings",
    },
    {
      icon: <FeedbackIcon sx={{ fontSize: "25px", color: "white" }} />,
      label: "Feedback",
      path: "/feedback",
    },
  ];

  const renderSection = (
    sections: Array<{ icon: JSX.Element; label: string; path: string }>
  ) => {
    return sections.map((section, index) => (
      <Box
        key={index}
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: 1,
          "&:hover": {
            backgroundColor: "#333", // Change to gray color on hover
            borderRadius: "10px",
          },
        }}
        onClick={() => navigate(section.path)} // Use navigate on click
        style={{ cursor: "pointer" }} // Add pointer cursor to indicate it's clickable
      >
        <IconButton>{section.icon}</IconButton>
        {isSidebarExpanded && (
          <Typography fontWeight={500} sx={{ marginLeft: 2 }}>
            {section.label}
          </Typography>
        )}
      </Box>
    ));
  };

  return (
    <Drawer
      sx={{
        width: isSidebarExpanded ? 240 : 80,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSidebarExpanded ? 240 : 80,
          boxSizing: "border-box",
          position: "fixed",
          top: 64,
          height: "calc(100vh - 64px)",
          backgroundColor: "#0F0F0F",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ padding: 2 }}>
        {/* Render Home, Shorts, Subscriptions */}
        {renderSection(sections)}

        <Divider sx={{ my: 2 }} />

        {/* Render History, Playlist, Watch Later, Liked Videos */}
        {renderSection(moreSections)}

        <Divider sx={{ my: 2 }} />

        {/* Render Trending, Music, Gaming, Sports */}
        {renderSection(trendingSections)}

        <Divider sx={{ my: 2 }} />

        {/* Render Settings, Feedback */}
        {renderSection(lastSections)}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
