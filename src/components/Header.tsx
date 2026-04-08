import React, { useState } from "react";
import {
  Typography,
  IconButton,
  Box,
  Avatar,
  TextField,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  styled,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Popover,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { fetchSearchResults } from "../api/youtube";
import type { YouTubeVideoInfo } from "../api/youtube";
import seriesMoviesData from "./driveData.json";
import { useAuth } from "./Auth/AuthContext";
import { useThemeMode } from "./ThemeContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarExpanded: boolean;
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

const SuggestionPaper = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: "calc(100% + 12px)",
  left: 0,
  right: 0,
  zIndex: 1500,
  maxHeight: "450px",
  overflowY: "auto",
  backgroundColor: theme.palette.mode === "dark" ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
}));

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarExpanded }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const auth = useAuth();
  const { toggleColorMode, primaryColor, setPrimaryColor } = useThemeMode();
  const open = Boolean(anchorEl);
  const notesOpen = Boolean(notificationsAnchorEl);

  const dummyNotifications = [
    { title: "New Series Added!", info: "Check out 'Lost & Found' in Drive" },
    { title: "Video Processed", info: "Your latest upload is now in 4K" },
    { title: "Quota Reset", info: "YouTube API quota refreshed" }
  ];

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const handleNotesClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(notificationsAnchorEl ? null : event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleNotesClose = () => setNotificationsAnchorEl(null);
  const handleLogout = () => {
    auth.logout();
    handleClose();
    navigate("/login");
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }

    const videoResults: SearchResult[] = [];
    
    // Check if query is a YouTube URL
    const ytUrlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = query.match(ytUrlRegex);
    if (match && match[1]) {
       videoResults.push({
         id: match[1],
         title: "Play YouTube Video from URL",
         subTitle: match[1],
         thumbnail: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`,
         type: "video"
       });
    }

    const lowerQuery = query.toLowerCase();
    const ytResults = await fetchSearchResults(query, 6);
    ytResults.forEach((video: YouTubeVideoInfo) => {
       if (video.id !== match?.[1]) { // Avoid duplicate if already matched by URL
         videoResults.push({
           id: video.id,
           title: video.title,
           subTitle: video.subTitle,
           thumbnail: video.thumbnail,
           type: "video",
         });
       }
    });

    const seriesResults: SearchResult[] = (seriesMoviesData as any).series
      .filter((s:any) => s.title.toLowerCase().includes(lowerQuery))
      .map((s:any) => ({ id: s.id, title: s.title, thumbnail: s.thumbnail, type: "series" }));

    setSuggestions([...videoResults, ...seriesResults]);
  };

  const handleSuggestionClick = (item: SearchResult) => {
    navigate(`/video/${item.id}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Sync with Content spacing (matches MainContainer/VideoPage)
  const sidebarWidthValue = isMobile ? 0 : (isSidebarExpanded ? 210 : 72);

  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1400,
        px: { xs: 1, sm: 1.5, md: 1.5 },
        pl: isMobile ? 1 : `${sidebarWidthValue + 16}px`, // Reduced padding to increase width
        pr: isMobile ? 1 : "20px",
        py: 1.2,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Box
        sx={{
          backgroundColor: isDark ? "rgba(10,10,10,0.75)" : "rgba(255,255,255,0.75)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          borderRadius: "22px",
          border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
          boxShadow: "none",
          height: 68,
          display: "flex",
          alignItems: "center",
          px: { xs: 1.5, sm: 4 }, // Increased inner padding
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
             borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" gap={2}>
          {/* Brand */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={onToggleSidebar}
              sx={{
                color: isDark ? "white" : "black",
                bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" },
                borderRadius: "14px",
              }}
            >
              <MenuIcon />
            </IconButton>
            <Box display="flex" alignItems="center" gap={1} sx={{ cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", "&:hover": { transform: "scale(1.02)" } }} onClick={() => navigate("/")}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: primaryColor,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "none",
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                }}
              >
                <Box
                  sx={{
                    width: 0,
                    height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderLeft: "8px solid white",
                    ml: "2px",
                  }}
                />
              </Box>
              {!isMobile && (
                <Typography sx={{ fontWeight: 700, fontSize: "20px", letterSpacing: "-0.3px", color: isDark ? "#fff" : "#000" }}>TomTube</Typography>
              )}
            </Box>
          </Box>

          {/* Search Island */}
          <Box
            sx={{
              flexGrow: 1,
              maxWidth: isMobile ? "240px" : "620px",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: "18px",
                overflow: "hidden",
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                border: "1px solid transparent",
                borderColor: searchFocused ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") : "transparent",
                transition: "all 0.3s ease",
                boxShadow: "none",
              }}
            >
              <Box sx={{ pl: 2, color: searchFocused ? primaryColor : "#888", display: "flex", alignItems: "center" }}>
                <SearchIcon sx={{ fontSize: 20 }} />
              </Box>
              <TextField
                fullWidth
                size="small"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => { setTimeout(() => setSearchFocused(false), 200); setShowSuggestions(false); }}
                onKeyDown={(e) => {
                   if (e.key === "Enter" && searchQuery.trim()) {
                      const ytUrlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                      const match = searchQuery.match(ytUrlRegex);
                      if (match && match[1]) {
                        navigate(`/video/${match[1]}`);
                        setSearchQuery("");
                        setShowSuggestions(false);
                      } else {
                        // Standard search logic (could go to search results page)
                        if (suggestions.length > 0) handleSuggestionClick(suggestions[0]);
                      }
                   }
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { border: "none" },
                    color: isDark ? "white" : "black",
                    fontSize: "15px",
                    fontWeight: 500,
                  }
                }}
              />
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ mr: 1, opacity: 0.6 }}>
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>

            {showSuggestions && suggestions.length > 0 && (
              <SuggestionPaper>
                <List dense sx={{ py: 1 }}>
                  {suggestions.map((item) => (
                    <ListItemButton key={item.id} onClick={() => handleSuggestionClick(item)} sx={{ px: 2, py: 1.5, borderRadius: "12px", mx: 1, mb: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}>
                      <ListItemAvatar>
                        <Avatar variant="rounded" src={item.thumbnail} sx={{ width: 44, height: 44, border: "1px solid rgba(255,255,255,0.05)" }} />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={item.title} 
                        secondary={item.subTitle} 
                        primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: "14px", color: isDark ? "#fff" : "#000" } }}
                        secondaryTypographyProps={{ sx: { fontSize: "11px", color: "rgba(128,128,128,0.8)" } }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </SuggestionPaper>
            )}
          </Box>

          {/* Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Toggle Theme">
              <IconButton onClick={toggleColorMode} sx={{ color: isDark ? "#fff" : "#000", bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
                {isDark ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            {!isMobile && (
              <Tooltip title="Notifications">
                <IconButton 
                  onClick={handleNotesClick}
                  sx={{ color: isDark ? "#fff" : "#000" }}>
                  <Badge 
                    badgeContent={3} 
                    sx={{ 
                      "& .MuiBadge-badge": { 
                        bgcolor: primaryColor, 
                        color: "#fff" 
                      } 
                    }}
                  >
                    <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            <Popover
              open={notesOpen}
              anchorEl={notificationsAnchorEl}
              onClose={handleNotesClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ sx: { mt: 1.5, p: 2, borderRadius: "16px", minWidth: 280, bgcolor: isDark ? "#121212" : "#fff", border: "1px solid rgba(255,255,255,0.08)" } }}
            >
              <Typography sx={{ fontWeight: 600, mb: 2, px: 1 }}>Notifications</Typography>
              <List dense>
                {dummyNotifications.map((n, i) => (
                  <ListItemButton key={i} sx={{ borderRadius: "10px", mb: 0.5 }}>
                    <ListItemText primary={n.title} secondary={n.info} primaryTypographyProps={{ sx: { fontWeight: 500, fontSize: "13px" } }} />
                  </ListItemButton>
                ))}
              </List>
            </Popover>
            <IconButton onClick={handleAvatarClick} sx={{ p: 0.5 }}>
               <Avatar sx={{ width: 38, height: 38, border: `2px solid ${primaryColor}`, background: primaryColor, fontWeight: 800, fontSize: "15px" }}>T</Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx: { mt: 1.5, minWidth: 240, bgcolor: isDark ? "#111" : "#fff", borderRadius: "18px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)" } }}>
               <Box sx={{ px: 2.5, py: 2 }}>
                 <Typography sx={{ fontWeight: 600, fontSize: "15px", color: isDark ? "#fff" : "#000" }}>Towsif Muhtadi Khan</Typography>
                 <Typography sx={{ fontSize: "12px", color: "gray" }}>Premium Account</Typography>
               </Box>
               <Divider sx={{ opacity: 0.1 }} />
               
               <Box sx={{ p: 2 }}>
                  <Typography variant="caption" sx={{ color: "gray", fontWeight: 600, mb: 1, display: "block" }}>Branding Color</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {["#ff0000", "#3ea6ff", "#9d4edd", "#2d6a4f", "#ff9f1c"].map(c => (
                      <Box 
                        key={c} 
                        onClick={() => setPrimaryColor(c)}
                        sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: c, cursor: "pointer", border: primaryColor === c ? "2px solid white" : "none", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }} 
                      />
                    ))}
                  </Box>
               </Box>
               <Divider sx={{ opacity: 0.1 }} />

               <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: primaryColor, fontWeight: 600 }}>
                 <LogoutIcon sx={{ fontSize: 20, mr: 1.5 }} /> Logout
               </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
