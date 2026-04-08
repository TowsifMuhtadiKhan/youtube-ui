import React, { useState } from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { useThemeMode } from "./ThemeContext";

const shortsData = [
  {
    id: "RlMYO9t7xJY",
    author: "@arya_edits",
    title: "Khabo Ke Nazar 👁️ 😍 💖 #RomanticLofi ...",
    music: "Maine Khudse Bhi Jyada Tumhe Chaha Hai..",
    likes: "30K",
    comments: "123"
  },
  {
    id: "-5zO_Db8D8Y",
    author: "@lofi_vibes",
    title: "Vibe check ✨ #lofi #chill",
    music: "Late Night Study Session",
    likes: "15K",
    comments: "450"
  },
  {
    id: "mHEXUkwHOgs",
    author: "@romance_lyrics",
    title: "Dil Se Dil Tak ❤️ #love #trending",
    music: "Arijit Singh Remix",
    likes: "42K",
    comments: "890"
  }
];

const ShortsPage: React.FC = () => {
  const { primaryColor } = useThemeMode();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentShort = shortsData[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % shortsData.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + shortsData.length) % shortsData.length);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        pt: { xs: "56px", md: "80px" },
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Search Bar Placeholder (as seen in screenshot) */}
      <Box sx={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10, width: "100%", maxWidth: 600, px: 2, display: "flex", gap: 1 }}>
         <Box sx={{ flex: 1, height: 40, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "20px", display: "flex", alignItems: "center", px: 2 }}>
            <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>hai main hi mar hi jaaun</Typography>
         </Box>
      </Box>

      {/* Main Shorts Container */}
      <Box sx={{ position: "relative", height: "100%", aspectRatio: "9/16", maxHeight: "90vh", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
         <iframe
           width="100%"
           height="100%"
           src={`https://www.youtube.com/embed/${currentShort.id}?autoplay=1&controls=1&rel=0&loop=1&playlist=${currentShort.id}`}
           title="YouTube Shorts"
           frameBorder="0"
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
           style={{ pointerEvents: "auto", border: 0 }}
         />

         {/* Info Overlay */}
         <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 2.5, background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
               <Avatar sx={{ width: 34, height: 34, border: "2px solid #fff" }} />
               <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#fff" }}>{currentShort.author}</Typography>
               <Box sx={{ bgcolor: primaryColor, color: "#fff", px: 2, py: 0.6, borderRadius: "20px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 14px ${primaryColor}44`, transition: "all 0.2s", "&:hover": { transform: "scale(1.05)", filter: "brightness(1.1)" } }}>Subscribe</Box>
            </Box>
            <Typography sx={{ color: "#fff", fontSize: "0.95rem", mb: 1, fontWeight: 500 }}>{currentShort.title}</Typography>
            <Box display="flex" alignItems="center" gap={1} sx={{ opacity: 0.9 }}>
               <MusicNoteIcon sx={{ fontSize: 16, color: "#fff" }} />
               <Typography sx={{ color: "#fff", fontSize: "0.85rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{currentShort.music}</Typography>
            </Box>
         </Box>
      </Box>

      {/* Sidebar Actions (Right side of video) */}
      <Box sx={{ position: "absolute", bottom: 40, marginLeft: "calc(9/16 * 90vh + 30px)", display: "flex", flexDirection: "column", gap: 2.5, alignItems: "center" }}>
          <Box sx={{ textAlign: "center" }}>
            <IconButton sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff", mb: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><FavoriteIcon /></IconButton>
            <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }}>{currentShort.likes}</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <IconButton sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff", mb: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><CommentIcon /></IconButton>
            <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }}>{currentShort.comments}</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <IconButton sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff", mb: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><ShareIcon /></IconButton>
            <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }}>Share</Typography>
          </Box>
          <IconButton sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff" }}><MoreVertIcon /></IconButton>
      </Box>

      {/* Navigation arrows (far right) */}
      <Box sx={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 2 }}>
         <IconButton onClick={handlePrev} sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff" }}><ArrowUpwardIcon /></IconButton>
         <IconButton onClick={handleNext} sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#fff" }}><ArrowDownwardIcon /></IconButton>
      </Box>
    </Box>
  );
};

export default ShortsPage;
