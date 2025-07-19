import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Siderbar";
import MainContent from "./components/MainContainer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import MediaBrowser from "./components/Shorts";
import { Subscription } from "./components/Subscription";
import VideoPage from "./components/VideoPage";
import { useMediaQuery } from "@mui/material";
import { DrivePlayer } from "./components/DrivePlayer";

const theme = createTheme({
  typography: {
    allVariants: {
      color: "white",
      fontSize: "14px",
    },
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "#4e4e4eff",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "#090909",
        },
        indicator: {
          backgroundColor: "#eeeeeeff",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#949494ff",
          textTransform: "none",
          "&.Mui-selected": {
            color: "#eeeeeeff",
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSidebarExpanded, setSidebarExpanded] = useState(!isMobile);

  const handleToggleSidebar = () => {
    setSidebarExpanded((prevState) => !prevState);
  };

  useEffect(() => {
    setSidebarExpanded(!isMobile);
  }, [isMobile]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {" "}
        {/* Add this wrapper */}
        <Header onToggleSidebar={handleToggleSidebar} />
        <Sidebar isSidebarExpanded={isSidebarExpanded} />
        <Routes>
          <Route
            path="/"
            element={<MainContent isSidebarExpanded={isSidebarExpanded} />}
          />
          <Route
            path="/home"
            element={<MainContent isSidebarExpanded={isSidebarExpanded} />}
          />
          <Route
            path="/shorts"
            element={<MediaBrowser isSidebarExpanded={isSidebarExpanded} />}
          />
          <Route
            path="/subscriptions"
            element={<Subscription isSidebarExpanded={isSidebarExpanded} />}
          />
          <Route
            path="/video/:id"
            element={<VideoPage isSidebarExpanded={isSidebarExpanded} />}
          />
          <Route
            path="/player"
            element={<DrivePlayer isSidebarExpanded={isSidebarExpanded} />}
          />
          {/* Define other routes here */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
