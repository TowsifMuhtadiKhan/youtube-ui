import React from "react";
import { Box, Typography } from "@mui/material";

interface MainContentProps {
  isSidebarExpanded: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarExpanded }) => {
  return (
    <Box
      component="main"
      sx={{
        marginLeft: isSidebarExpanded ? 30 : 10,
        marginTop: 10,
        padding: 2,

        overflowY: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Main Content Area
      </Typography>
      <Typography variant="h6" gutterBottom>
        This is where the content goes.
      </Typography>
    </Box>
  );
};

export default MainContent;
