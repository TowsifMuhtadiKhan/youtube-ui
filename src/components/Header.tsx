import React from "react";
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
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Logo from "../assets/youtube-svgrepo-com.svg";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AddIcon from "@mui/icons-material/Add";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import SearchIcon from "@mui/icons-material/Search";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1201,
        backgroundColor: "#0F0F0F",
        boxShadow: "none",
        px: isMobile ? 1 : 2, // Adjust horizontal padding
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          gap={1}
        >
          {/* Left Section - Logo & Menu */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton edge="start" color="inherit" onClick={onToggleSidebar}>
              <MenuIcon />
            </IconButton>
            {!isMobile && (
              <>
                <img
                  src={Logo}
                  alt="Logo"
                  style={{ height: 30, marginRight: 2 }}
                />
                <Typography
                  fontSize={isTablet ? "18px" : "20px"}
                  fontWeight="bold"
                >
                  YouTube
                </Typography>
              </>
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
            }}
          >
            {!isMobile && (
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
                  InputProps={{
                    sx: {
                      borderRadius: "20px 0 0 20px",
                      backgroundColor: "#111",
                      "& fieldset": { borderColor: "#3F3F3F" },
                      "&:hover fieldset": { borderColor: "#5F5F5F" },
                      "&.Mui-focused fieldset": { borderColor: "#5F5F5F" },
                      "& input::placeholder": { color: "#999", opacity: 1 },
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
            )}
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
