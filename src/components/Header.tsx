import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Button,
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
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Logo from "../assets/youtube-svgrepo-com.svg";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AddIcon from "@mui/icons-material/Add";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import videoData from "./data.json";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const SuggestionPaper = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 1300,
  marginTop: theme.spacing(0.5),
  maxHeight: "400px",
  overflowY: "auto",
  backgroundColor: "#0F0F0F",
  border: "1px solid #3F3F3F",
}));

const SuggestionItem = styled(ListItemButton)(({}) => ({
  "&:hover": {
    backgroundColor: "#585858ff !important",
  },
}));

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = videoData.filter(
      (video) =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.subTitle.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSuggestionClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0].id);
      }
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1201,
        backgroundColor: "#0F0F0F",
        boxShadow: "none",
        px: isMobile ? 1 : 2,
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          gap={1}
          position="relative"
        >
          {/* Left Section - Logo & Menu */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* {!isMobile && ( */}
            <IconButton edge="start" color="inherit" onClick={onToggleSidebar}>
              <MenuIcon />
            </IconButton>
            {/* )} */}
            <img
              src={Logo}
              alt="Logo"
              style={{ height: 30, marginRight: 2 }}
              onClick={() => navigate("/")}
            />
            {!isMobile && (
              <Typography
                fontSize={isTablet ? "18px" : "20px"}
                fontWeight="bold"
              >
                YouTube
              </Typography>
            )}
          </Box>

          {/* Center Section - Search */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              flexGrow: isMobile ? 0 : 1,
              maxWidth: isMobile ? "none" : "600px",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              border={1}
              borderColor="#3F3F3F"
              borderRadius="20px"
              bgcolor="#222"
              sx={{ width: "100%" }}
            >
              <TextField
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                InputProps={{
                  sx: {
                    borderRadius: "20px 0 0 20px",
                    backgroundColor: "#111",
                    "& fieldset": { borderColor: "#3F3F3F" },
                    "&:hover fieldset": { borderColor: "#5F5F5F" },
                    "&.Mui-focused fieldset": { borderColor: "#5F5F5F" },
                    "& input::placeholder": { color: "#999", opacity: 1 },
                    color: "#fff",
                  },
                }}
                variant="outlined"
                placeholder="Search"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": { height: 40 },
                }}
              />
              <IconButton
                sx={{
                  borderRadius: "0 20px 20px 0",
                  padding: "8px",
                  backgroundColor: "#222",
                  "&:hover": { backgroundColor: "#333" },
                }}
              >
                <SearchIcon sx={{ fontSize: "20px", color: "white" }} />
              </IconButton>
            </Box>

            {/* Only show voice icon on larger screens */}
            {!isMobile && (
              <IconButton
                sx={{
                  backgroundColor: "#3F3F3F",
                  "&:hover": { backgroundColor: "#5F5F5F" },
                  borderRadius: "50%",
                  padding: "8px",
                }}
              >
                <KeyboardVoiceIcon sx={{ fontSize: "20px", color: "white" }} />
              </IconButton>
            )}

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <SuggestionPaper>
                <List dense>
                  {suggestions.map((video) => (
                    <ListItem key={video.id} disablePadding>
                      <SuggestionItem
                        onClick={() => handleSuggestionClick(video.id)}
                      >
                        <ListItemAvatar>
                          <Box
                            component="img"
                            src={video.thumbnail}
                            alt={video.title}
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 1,
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={video.title}
                          secondary={video.subTitle}
                          primaryTypographyProps={{
                            sx: { color: "#fff" },
                          }}
                          secondaryTypographyProps={{
                            sx: { color: "#aaa" },
                          }}
                        />
                      </SuggestionItem>
                    </ListItem>
                  ))}
                </List>
              </SuggestionPaper>
            )}
            {showSuggestions && suggestions.length === 0 && (
              <SuggestionPaper>
                <Typography sx={{ padding: 2, color: "#aaa" }}>
                  No suggestions found
                </Typography>
              </SuggestionPaper>
            )}
          </Box>

          {/* Right Section - Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            {!isMobile && (
              <Button
                startIcon={<AddIcon sx={{ color: "white" }} />}
                sx={{
                  backgroundColor: "#3F3F3F",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "grey.500" },
                  color: "white",
                }}
              >
                Create
              </Button>
            )}
            {!isMobile && (
              <IconButton>
                <NotificationsNoneOutlinedIcon
                  sx={{ fontSize: "26px", color: "white" }}
                />
              </IconButton>
            )}
            <Avatar sx={{ width: 32, height: 32 }}>T</Avatar>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
