import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Siderbar";
import MainContent from "./components/MainContainer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Shorts } from "./components/Shorts";
import { Subscription } from "./components/Subscription";

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
          color: "#949494ff", // Default tab color
          textTransform: "none",
          "&.Mui-selected": {
            color: "#eeeeeeff", // Selected tab color
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarExpanded((prevState) => !prevState);
  };

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
            element={<Shorts isSidebarExpanded={isSidebarExpanded} />}
          />
          <Route
            path="/subscriptions"
            element={<Subscription isSidebarExpanded={isSidebarExpanded} />}
          />
          {/* Define other routes here */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
