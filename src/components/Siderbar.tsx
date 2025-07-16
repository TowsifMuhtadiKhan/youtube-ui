// src/components/Sidebar.tsx
import React from "react";
import { Box, Divider, Drawer, Typography, IconButton } from "@mui/material";
import {
  Home as HomeIcon,
  Subscriptions as SubscriptionsIcon,
  VideoLibrary as VideoLibraryIcon,
} from "@mui/icons-material";

interface SidebarProps {
  isSidebarExpanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarExpanded }) => {
  return (
    <Drawer
      sx={{
        width: isSidebarExpanded ? 240 : 80, // Adjust width based on expansion
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSidebarExpanded ? 240 : 80, // Adjust width based on expansion
          boxSizing: "border-box",
          position: "fixed",
          top: 64, // Adjust according to the header height
          height: "calc(100vh - 64px)", // Full height minus the header
          backgroundColor: "#0F0F0F", // Match the background color
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ padding: 2 }}>
        {/* Home section */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
          <IconButton>
            <HomeIcon />
          </IconButton>
          {isSidebarExpanded && (
            <Typography variant="body1" sx={{ marginLeft: 2 }}>
              Home
            </Typography>
          )}
        </Box>

        {/* Shorts section */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
          <IconButton>
            <VideoLibraryIcon />
          </IconButton>
          {isSidebarExpanded && (
            <Typography variant="body1" sx={{ marginLeft: 2 }}>
              Shorts
            </Typography>
          )}
        </Box>

        {/* Subscriptions section */}
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
          <IconButton>
            <SubscriptionsIcon />
          </IconButton>
          {isSidebarExpanded && (
            <Typography variant="body1" sx={{ marginLeft: 2 }}>
              Subscriptions
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />

      {/* More sections */}
      <Box sx={{ padding: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
          <IconButton>
            <HomeIcon />
          </IconButton>
          {isSidebarExpanded && (
            <Typography variant="body1" sx={{ marginLeft: 2 }}>
              More Section
            </Typography>
          )}
        </Box>
      </Box>

      <Divider />
    </Drawer>
  );
};

export default Sidebar;
