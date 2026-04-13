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
import MediaBrowser from "./components/Shorts";
import { Subscription } from "./components/Subscription";
import VideoPage from "./components/VideoPage";
import { CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { DrivePlayer } from "./components/DrivePlayer";
import ShortsPage from "./components/ShortsPage";
import Settings from "./components/Settings";
import PlaylistPage from "./components/PlaylistPage";
import AdminPage from "./components/AdminPage";
import { AuthProvider, useAuth } from "./components/Auth/AuthContext";
import Login from "./components/Auth/Login";
import Box from "@mui/material/Box";
import { AppThemeProvider } from "./components/ThemeContext";

const LoadingScreen = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    sx={{ backgroundColor: "background.default" }}
  >
    <Box textAlign="center">
      <CircularProgress sx={{ color: "#ff0000" }} size={36} thickness={3} />
    </Box>
  </Box>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated !== undefined) {
      setIsInitialized(true);
    }
  }, [auth.isAuthenticated]);

  if (!isInitialized) return <LoadingScreen />;
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!auth.isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const AppContent = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSidebarExpanded, setSidebarExpanded] = useState(!isMobile);
  const location = useLocation();

  const handleToggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    if (isMobile) setSidebarExpanded(false);
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarExpanded(false);
    } else {
      // Auto-collapse sidebar on video page for better viewing
      if (location.pathname.startsWith("/video/")) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    }
  }, [location.pathname, isMobile]);

  const isLoginPage = location.pathname === "/login";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        transition: "background-color 0.3s ease",
      }}
    >
      {!isLoginPage && (
        <Header
          onToggleSidebar={handleToggleSidebar}
          isSidebarExpanded={isSidebarExpanded}
        />
      )}
      {!isLoginPage && (
        <Sidebar
          isSidebarExpanded={isSidebarExpanded}
          onClose={handleCloseSidebar}
        />
      )}
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
        <Route
          path="/shorts"
          element={
            <ProtectedRoute>
              <ShortsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings isSidebarExpanded={isSidebarExpanded} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlist"
          element={
            <ProtectedRoute>
              <PlaylistPage isSidebarExpanded={isSidebarExpanded} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage isSidebarExpanded={isSidebarExpanded} />
            </AdminRoute>
          }
        />
      </Routes>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <AppThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </AppThemeProvider>
  );
};

export default App;
