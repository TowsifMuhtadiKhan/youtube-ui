import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Button,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Logo from "../assets/youtube-svgrepo-com.svg";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AddIcon from "@mui/icons-material/Add";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1201,
        backgroundColor: "#0F0F0F",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          width="100%"
        >
          <Box display="flex" alignItems="center">
            {" "}
            <IconButton edge="start" color="inherit" onClick={onToggleSidebar}>
              <MenuIcon />
            </IconButton>
            <img
              src={Logo}
              alt="Logo"
              style={{ height: 40, marginRight: 2, marginLeft: 14 }}
            />
            <Typography
              fontSize={"20px"}
              fontWeight={"bold"}
              sx={{ flexGrow: 1 }}
            >
              YouTube
            </Typography>
          </Box>
          <Box>
            <Box></Box>
            <IconButton
              sx={{
                backgroundColor: "#3F3F3F",
                "&:hover": {
                  backgroundColor: "#5F5F5F",
                },
                borderRadius: "50%",
                padding: "6px",
              }}
            >
              <KeyboardVoiceIcon sx={{ fontSize: "25px", color: "white" }} />
            </IconButton>
          </Box>
          <Box display="flex" alignItems="center" gap={3}>
            <Button
              startIcon={<AddIcon sx={{ color: "white" }} />}
              sx={{
                backgroundColor: "#3F3F3F",
                padding: "6px 16px",
                borderRadius: "20px",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "grey.500",
                },
                color: "white",
                "& .MuiButton-startIcon": {
                  color: "white",
                },
              }}
            >
              Create
            </Button>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: "30px" }} />
            <Avatar sx={{ width: 34, height: 34 }}>T</Avatar>{" "}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
