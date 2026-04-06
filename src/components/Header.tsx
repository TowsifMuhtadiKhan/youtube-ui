import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  TextField,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  styled,
  Tooltip,
  Badge,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Logo from "../assets/youtube-svgrepo-com.svg";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useNavigate } from "react-router-dom";
import videoData from "./data.json";
import seriesMoviesData from "./driveData.json";
import { useAuth } from "./Auth/AuthContext";
import { useThemeMode } from "./ThemeContext";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import Divider from "@mui/material/Divider";

interface HeaderProps {
  onToggleSidebar: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  subTitle?: string;
  description?: string;
  thumbnail: string;
  type: "video" | "series" | "movie" | "episode";
  episode_number?: number;
  series_id?: string;
}

const SuggestionPaper = styled(Paper)(() => ({
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  zIndex: 1300,
  maxHeight: "420px",
  overflowY: "auto",
  backgroundColor: "#1c1c1c",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
}));

const SuggestionItem = styled(ListItemButton)(() => ({
  padding: "10px 16px",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.07) !important",
  },
}));

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const auth = useAuth();
  const { colorMode, toggleColorMode } = useThemeMode();
  const open = Boolean(anchorEl);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    auth.logout();
    handleClose();
    navigate("/login");
  };

  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const videoResults: SearchResult[] = videoData
      .filter(
        (video) =>
          video.title.toLowerCase().includes(lowerQuery) ||
          (video.subTitle && video.subTitle.toLowerCase().includes(lowerQuery))
      )
      .map((video) => ({
        id: video.id,
        title: video.title,
        subTitle: video.subTitle,
        thumbnail: video.thumbnail,
        type: "video",
      }));

    const seriesResults: SearchResult[] = seriesMoviesData.series
      .filter(
        (series) =>
          series.title.toLowerCase().includes(lowerQuery) ||
          series.description.toLowerCase().includes(lowerQuery)
      )
      .flatMap((series) => [
        {
          id: series.id,
          title: series.title,
          description: series.description,
          thumbnail: series.thumbnail,
          type: "series" as const,
        },
        ...series.episodes
          .filter(
            (episode) =>
              episode.title.toLowerCase().includes(lowerQuery) ||
              episode.description.toLowerCase().includes(lowerQuery)
          )
          .map((episode) => ({
            id: `${series.id}_${episode.episode_number}`,
            title: `${series.title} - Ep ${episode.episode_number}: ${episode.title}`,
            description: episode.description,
            thumbnail: episode.thumbnail,
            type: "episode" as const,
            episode_number: episode.episode_number,
            series_id: series.id,
          })),
      ]);

    const movieResults: SearchResult[] = seriesMoviesData.movies
      .filter(
        (movie) =>
          movie.title.toLowerCase().includes(lowerQuery) ||
          movie.description.toLowerCase().includes(lowerQuery)
      )
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        description: movie.description,
        thumbnail: movie.thumbnail,
        type: "movie",
      }));

    setSuggestions([...videoResults, ...seriesResults, ...movieResults]);
  };

  const handleSuggestionClick = (item: SearchResult) => {
    switch (item.type) {
      case "video": navigate(`/video/${item.id}`); break;
      case "series": navigate(`/series/${item.id}`); break;
      case "movie": navigate(`/movie/${item.id}`); break;
      case "episode":
        if (item.series_id) navigate(`/series/${item.series_id}/episode/${item.episode_number}`);
        break;
    }
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim() !== "" && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getSubtitle = (item: SearchResult) => {
    const typeLabel = item.type === "video" ? "Video" : item.type === "movie" ? "Movie" : item.type === "series" ? "Series" : "Episode";
    const detail = item.subTitle || item.description || "";
    return `${typeLabel}${detail ? " • " + truncateText(detail, 45) : ""}`;
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: 1201,
        backgroundColor: isDark ? "rgba(15,15,15,0.92)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        px: isMobile ? 1 : 2,
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important", gap: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          gap={1}
          position="relative"
        >
          {/* Left – Logo & Menu */}
          <Box display="flex" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
            <Tooltip title="Toggle sidebar" placement="bottom">
              <IconButton
                edge="start"
                onClick={onToggleSidebar}
                sx={{
                  color: isDark ? "#f1f1f1" : "#0f0f0f",
                  "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" },
                  borderRadius: "50%",
                }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ cursor: "pointer", "&:hover": { opacity: 0.85 } }}
              onClick={() => navigate("/")}
            >
              <img src={Logo} alt="TomTube" style={{ height: 28 }} />
              {!isMobile && (
                <Typography
                  sx={{
                    fontSize: isTablet ? "17px" : "19px",
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    color: isDark ? "#f1f1f1" : "#0f0f0f",
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  TomTube
                </Typography>
              )}
            </Box>
          </Box>

          {/* Center – Search */}
          <Box
            sx={{
              flexGrow: isMobile ? 0 : 1,
              maxWidth: isMobile ? "160px" : "560px",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: searchFocused
                  ? isDark ? "1.5px solid rgba(255,255,255,0.3)" : "1.5px solid rgba(0,0,0,0.3)"
                  : isDark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(0,0,0,0.15)",
                borderRadius: "24px",
                overflow: "hidden",
                backgroundColor: isDark
                  ? (searchFocused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)")
                  : (searchFocused ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.04)"),
                transition: "all 0.2s ease",
                boxShadow: searchFocused ? "0 0 0 3px rgba(255,0,0,0.08)" : "none",
              }}
            >
              <Box
                sx={{
                  pl: 2,
                  display: "flex",
                  alignItems: "center",
                  color: searchFocused ? (isDark ? "#f1f1f1" : "#0f0f0f") : "#888",
                }}
              >
                <SearchIcon sx={{ fontSize: 18 }} />
              </Box>
              <TextField
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => { setShowSuggestions(true); setSearchFocused(true); }}
                onBlur={() => { setTimeout(() => setShowSuggestions(false), 200); setSearchFocused(false); }}
                InputProps={{
                  sx: {
                    backgroundColor: "transparent",
                    color: isDark ? "#f1f1f1" : "#0f0f0f",
                    "& fieldset": { border: "none" },
                    "& input::placeholder": { color: "#888", opacity: 1, fontSize: "14px" },
                    fontSize: "14px",
                    height: 38,
                    px: 0.5,
                  },
                }}
                variant="outlined"
                placeholder={isMobile ? "Search..." : "Search TomTube..."}
                sx={{ width: "100%" }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  sx={{ mr: 0.5, color: "#888", "&:hover": { color: "#f1f1f1" }, p: 0.5 }}
                >
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <SuggestionPaper>
                {suggestions.length > 0 ? (
                  <List dense disablePadding sx={{ py: 0.5 }}>
                    {suggestions.map((item) => (
                      <ListItem key={item.id} disablePadding>
                        <SuggestionItem onClick={() => handleSuggestionClick(item)}>
                          <ListItemAvatar sx={{ minWidth: 50 }}>
                            <Box
                              component="img"
                              src={item.thumbnail}
                              alt={item.title}
                              sx={{
                                width: 44,
                                height: 44,
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={truncateText(item.title, 42)}
                            secondary={getSubtitle(item)}
                            primaryTypographyProps={{
                              sx: { color: "#f1f1f1", fontWeight: 500, fontSize: "13px" },
                            }}
                            secondaryTypographyProps={{
                              sx: { color: "#888", fontSize: "11px", mt: 0.25 },
                            }}
                          />
                        </SuggestionItem>
                      </ListItem>
                    ))}
                  </List>
                ) : searchQuery.trim() ? (
                  <Box sx={{ px: 2, py: 2.5, textAlign: "center" }}>
                    <Typography sx={{ color: "#666", fontSize: "13px" }}>
                      No results for "{truncateText(searchQuery, 30)}"
                    </Typography>
                  </Box>
                ) : null}
              </SuggestionPaper>
            )}
          </Box>

          {/* Right – Actions */}
          <Box display="flex" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
            {/* Theme Toggle */}
            <Tooltip title={colorMode === "dark" ? "Switch to Light mode" : "Switch to Dark mode"} placement="bottom">
              <IconButton
                onClick={toggleColorMode}
                sx={{
                  color: isDark ? "#f1f1f1" : "#0f0f0f",
                  "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" },
                }}
              >
                {colorMode === "dark" ? (
                  <LightModeIcon sx={{ fontSize: 22 }} />
                ) : (
                  <DarkModeIcon sx={{ fontSize: 22 }} />
                )}
              </IconButton>
            </Tooltip>

            {!isMobile && (
              <Tooltip title="Notifications" placement="bottom">
                <IconButton
                  sx={{
                    color: isDark ? "#f1f1f1" : "#0f0f0f",
                    "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" },
                  }}
                >
                  <Badge badgeContent={3} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "10px", minWidth: "16px", height: "16px" } }}>
                    <NotificationsNoneOutlinedIcon sx={{ fontSize: 24 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Account" placement="bottom">
              <IconButton onClick={handleAvatarClick} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    fontSize: "14px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #ff0000, #cc2200)",
                    border: isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid rgba(0,0,0,0.15)",
                    transition: "all 0.2s ease",
                    "&:hover": { border: "2px solid rgba(255,0,0,0.5)", transform: "scale(1.05)" },
                  }}
                >
                  T
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  backgroundColor: "#1c1c1c",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                  "& .MuiMenuItem-root": {
                    fontSize: "14px",
                    color: "#f1f1f1",
                    py: 1.25,
                    px: 2,
                    gap: 1.5,
                    borderRadius: "8px",
                    mx: 0.5,
                    mb: 0.25,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                <Typography sx={{ fontSize: "12px", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Account
                </Typography>
              </Box>
              <MenuItem onClick={() => navigate("/")}>
                <VideoLibraryIcon sx={{ fontSize: 18, color: "#888" }} />
                My Library
              </MenuItem>
              <MenuItem>
                <PersonOutlineIcon sx={{ fontSize: 18, color: "#888" }} />
                Profile
              </MenuItem>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 0.5, mx: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ color: "#ff6b6b !important" }}>
                <LogoutIcon sx={{ fontSize: 18, color: "#ff6b6b" }} />
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
