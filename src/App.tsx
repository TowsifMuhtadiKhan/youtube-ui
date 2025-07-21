import React, { useEffect, useState, type JSX } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Siderbar";
import MainContent from "./components/MainContainer";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MediaBrowser from "./components/Shorts";
import { Subscription } from "./components/Subscription";
import VideoPage from "./components/VideoPage";
import { useMediaQuery } from "@mui/material";
import { DrivePlayer } from "./components/DrivePlayer";
import { AuthProvider, useAuth } from "./components/Auth/AuthContext";
import Login from "./components/Auth/Login";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

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

const LoadingScreen = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="#0F0F0F"
  >
    <CircularProgress color="primary" />
  </Box>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if auth state has been initialized
    if (auth.isAuthenticated !== undefined) {
      setIsInitialized(true);
    }
  }, [auth.isAuthenticated]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppContent = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSidebarExpanded, setSidebarExpanded] = useState(!isMobile);
  const location = useLocation();

  const handleToggleSidebar = () => {
    setSidebarExpanded((prevState) => !prevState);
  };

  useEffect(() => {
    setSidebarExpanded(!isMobile);
  }, [isMobile]);

  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Header onToggleSidebar={handleToggleSidebar} />}
      {!isLoginPage && <Sidebar isSidebarExpanded={isSidebarExpanded} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainContent isSidebarExpanded={isSidebarExpanded} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainContent isSidebarExpanded={isSidebarExpanded} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <MediaBrowser isSidebarExpanded={isSidebarExpanded} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <Subscription isSidebarExpanded={isSidebarExpanded} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:id"
          element={
            <ProtectedRoute>
              <VideoPage isSidebarExpanded={isSidebarExpanded} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/player"
          element={
            <ProtectedRoute>
              <DrivePlayer isSidebarExpanded={isSidebarExpanded} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
