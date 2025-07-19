import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useLocation } from "react-router-dom";

interface DrivePlayerProps {
  isSidebarExpanded: boolean;
}

export const DrivePlayer: React.FC<DrivePlayerProps> = ({
  isSidebarExpanded,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const driveUrl = params.get("url") || "";

  return (
    <Box
      sx={{
        marginLeft: isSidebarExpanded ? "240px" : "64px",
        padding: 3,
        backgroundColor: "#000",
        minHeight: "100vh",
        marginTop: isMobile ? "56px" : "64px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="white" fontWeight={700}>
          Now Playing
        </Typography>
        <iframe
          src={driveUrl}
          width={isMobile ? "100%" : "80%"}
          height={isMobile ? "300" : "600"}
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{
            borderRadius: "8px",
            backgroundColor: "#111",
          }}
          title="Google Drive Video Player"
        />
      </Box>
    </Box>
  );
};
