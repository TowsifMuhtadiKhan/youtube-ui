import React, { useEffect, useRef, useState } from "react";
// Removed ReactPlayer for stability as requested
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  CircularProgress,
  TextField,
  Switch,
} from "@mui/material";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPopularVideos, fetchVideoDetails, fetchSearchResults } from "../api/youtube";
import type { YouTubeVideoInfo } from "../api/youtube";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import SendIcon from "@mui/icons-material/Send";
import SortIcon from "@mui/icons-material/Sort";
import { useThemeMode } from "./ThemeContext";

interface VideoPageProps {
  isSidebarExpanded: boolean;
}

const dummyComments = [
  { id: 1, user: "Alex Rivers", avatar: "A", text: "This is absolutely incredible! The production quality is top notch. I love how you balanced the technical details with practical examples.", likes: 245, time: "2 hours ago", replies: 3 },
  { id: 2, user: "Sarah Chen", avatar: "S", text: "I've been waiting for this episode for so long. Did not disappoint! The explanation of the new architecture was very clear.", likes: 128, time: "5 hours ago", replies: 1 },
  { id: 3, user: "Marcus Wright", avatar: "M", text: "The cinematography in the opening scene is breathtaking. What camera was used for those slow-motion shots?", likes: 89, time: "1 day ago", replies: 0 },
];

const VideoPage: React.FC<VideoPageProps> = ({ isSidebarExpanded }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(1100)); // Switch to stack layout earlier to prevent overlap
  const isDark = theme.palette.mode === "dark";
  const { primaryColor } = useThemeMode();

  // Gap Fix: Account for Sidebar position (left: 16) and width (200/72)
  const sidebarWidthValue = isSidebarExpanded ? 242 : 104;
  const totalMarginLeft = isMobile ? 0 : sidebarWidthValue;
  const headerHeight = 88; // Unified height

  // Design Tokens
  const baseBg = isDark ? "#0a0a0a" : "#f8f9fa";
  const glassBg = isDark ? "rgba(20, 20, 20, 0.65)" : "rgba(255, 255, 255, 0.75)";
  const glassBorder = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const accentRed = primaryColor;
  const textColor = isDark ? "#ffffff" : "#0f0f0f";
  const metaColor = isDark ? "#aaaaaa" : "#606060";
  const cardHover = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";

  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoInfo | null>(null);
  const [playlist, setPlaylist] = useState<YouTubeVideoInfo[]>([]);
  const [seriesPlaylist, setSeriesPlaylist] = useState<YouTubeVideoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [isRotated, setIsRotated] = useState(false);
  const [liked, setLiked] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const togglePlayback = () => {
    if (!iframeRef.current?.contentWindow) return;
    
    const nextPlaying = !isPlaying;
    const command = nextPlaying ? "playVideo" : "pauseVideo";
    
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: command }), 
      "*"
    );
    setIsPlaying(nextPlaying);

    // Show controls when toggling
    const overlay = document.querySelector(".player-overlay");
    if (overlay) {
      overlay.classList.add("visible");
      setTimeout(() => overlay.classList.remove("visible"), 2500);
    }
  };

  useEffect(() => {
    const loadVideoAndPlaylist = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0);
      
      const video = await fetchVideoDetails(id);
      setSelectedVideo(video);

      if (video) {
        const lowerTitle = video.title.toLowerCase();
        const isSeries = /episode|ep\s|part\s|season|madam\ssir/i.test(lowerTitle);
        
        if (isSeries) {
          const parts = video.title.split(" ");
          const seriesName = parts.slice(0, Math.min(3, parts.length)).join(" ");
          
          const [seriesResults, trendingResults] = await Promise.all([
            fetchSearchResults(seriesName, 20),
            fetchPopularVideos(12)
          ]);

          const getEpNum = (title: string) => {
            const match = title.match(/(?:ep|episode|part|season)\s*(\d+)/i);
            return match ? parseInt(match[1], 10) : 9999;
          };

          const sortedSeries = seriesResults.sort((a, b) => getEpNum(a.title) - getEpNum(b.title));
          setSeriesPlaylist(sortedSeries.filter(v => v.id !== id));
          setPlaylist(trendingResults.filter(v => v.id !== id));
        } else {
          const trendingResults = await fetchPopularVideos(15);
          setSeriesPlaylist([]);
          setPlaylist(trendingResults.filter(v => v.id !== id));
        }
      }
      setLoading(false);
    };
    loadVideoAndPlaylist();
  }, [id]);


  const toggleRotate = async () => {
    if (!playerContainerRef.current) return;
    if (!isRotated) {
      if (isMobile) {
        try { await ScreenOrientation.lock({ orientation: "landscape" }); } catch { /* ignore */ }
      }
      setIsRotated(true);
    } else {
      setIsRotated(false);
      if (isMobile) {
        try { await ScreenOrientation.unlock(); } catch { /* ignore */ }
      }
    }
  };

  useEffect(() => {
    if (isRotated) {
      document.body.classList.add("video-rotated");
    } else {
      document.body.classList.remove("video-rotated");
    }
    return () => document.body.classList.remove("video-rotated");
  }, [isRotated]);

  if (loading) {
    return (
      <Box sx={{ marginLeft: `${totalMarginLeft}px`, marginTop: `${headerHeight}px`, minHeight: "calc(100vh - 92px)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: baseBg }}>
        <CircularProgress sx={{ color: accentRed }} />
      </Box>
    );
  }

  if (!selectedVideo) {
    return (
      <Box sx={{ marginLeft: `${totalMarginLeft}px`, marginTop: `${headerHeight}px`, minHeight: "calc(100vh - 92px)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: baseBg }}>
        <Box textAlign="center" className="fade-in">
          <PlayArrowIcon sx={{ fontSize: 72, color: metaColor, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" sx={{ color: metaColor, fontWeight: 700 }}>Video not found</Typography>
          <Button onClick={() => navigate("/")} sx={{ mt: 2, color: accentRed }}>Back to Home</Button>
        </Box>
      </Box>
    );
  }

  // Function to extract video ID for YouTube Embed
  const getEmbedId = (video: YouTubeVideoInfo) => {
    const rawUrl = video.link || `https://www.youtube.com/watch?v=${id}`;
    if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
      try {
        const url = new URL(rawUrl);
        const v = url.searchParams.get("v");
        return v || id;
      } catch (e) {
        return id;
      }
    }
    return id;
  };

  return (
    <Box
      sx={{
        marginLeft: `${totalMarginLeft}px`,
        marginTop: `${headerHeight}px`,
        paddingRight: { xs: 0, md: "24px" },
        minHeight: "calc(100vh - 92px)",
        backgroundColor: "transparent",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        position: "relative",
        gap: 3,
        "@media (orientation: landscape) and (max-height: 500px)": {
          marginTop: 0,
          marginLeft: "0 !important",
          paddingRight: 0,
          gap: 0,
        },
      }}
    >
      {/* ── CINEMATIC AMBIENT BACKGROUND ── */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "-10%",
            backgroundImage: `url(${selectedVideo.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(120px) saturate(2) brightness(0.4)",
            transform: "scale(1.1)",
            opacity: isDark ? 0.45 : 0.25,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "radial-gradient(circle at 30% 30%, rgba(255,0,0,0.1), transparent 70%), linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,1) 90%)"
              : "radial-gradient(circle at 30% 30%, rgba(255,0,0,0.05), transparent 70%), linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(248,249,250,1) 90%)",
          }}
        />
      </Box>

      {/* ── LEFT COLUMN: PLAYER + INFO ── */}
      <Box
        sx={{
          flex: isMobile ? "none" : "1 1 0",
          zIndex: 1,
          pt: { xs: 0, md: 1 },
          pb: { xs: 4, md: 6 },
          maxWidth: isMobile ? "100%" : `calc(100vw - 440px - ${totalMarginLeft + 48}px)`,
          minWidth: 0,
        }}
      >
        {/* Video Player Container */}
        <Box
          ref={playerContainerRef}
          sx={{
            backgroundColor: "#000",
            overflow: "hidden",
            boxShadow: isRotated ? "none" : (isDark ? "0 25px 70px rgba(0,0,0,0.6)" : "none"),
            mb: { xs: 2.5, md: 4 },
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "&:hover .player-overlay": { opacity: 1 },
            
            // Layout states
            ...(isRotated ? {
              position: "fixed",
              top: "50%",
              left: "50%",
              width: "100vh",
              height: "100vw",
              transform: "translate(-50%, -50%) rotate(90deg)",
              transformOrigin: "center center",
              margin: 0,
              zIndex: 99999,
              borderRadius: 0,
            } : {
              position: "relative",
              width: "100%",
              height: "auto",
              aspectRatio: "16/9",
              borderRadius: { xs: 0, md: "24px" },
              zIndex: 10,
            }),
          }}
        >
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${getEmbedId(selectedVideo)}?rel=0&autoplay=1&enablejsapi=1&modestbranding=1&iv_load_policy=3&showinfo=0&color=white&mute=0`}
            title={selectedVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ 
              width: "100%", 
              height: "100%", 
              border: "none", 
              zIndex: 1,
            }}
          />
          
          {/* Top Masking Layer Removed per User Request */}
          
          {/* CLICK SHIELDS: Always active, placed outside the fading overlay */}
          {/* PROTECTIVE LAYER: Blocks exit links and End Screens while preserving Seek/Volume controls */}
          
          {/* Top Left Shield (Blocks Channel, Title) */}
          <Box 
            sx={{ 
              position: "absolute", 
              top: 0, left: 0, 
              width: isMobile ? "88%" : "82%", 
              height: isMobile ? "25%" : "20%", 
              pointerEvents: "auto", zIndex: 10, bgcolor: "transparent"
            }} 
          />

          {/* Bottom Left Shield (Blocks Share/Watch Later) */}
          <Box 
            sx={{ 
              position: "absolute", 
              bottom: 0, left: 0, width: "35%", height: isMobile ? "14%" : "10%", 
              pointerEvents: "auto", zIndex: 10, bgcolor: "transparent"
            }} 
          />

          {/* Bottom Right Shield (Blocks YouTube Logo link) */}
          <Box 
            sx={{ 
              position: "absolute", 
              bottom: 0, right: 0, width: "35%", height: isMobile ? "14%" : "10%", 
              pointerEvents: "auto", zIndex: 10, bgcolor: "transparent"
            }} 
          />

          {/* Center Shield (Blocks End-Screen cards and annotations + Toggles Playback) */}
          <Box 
            sx={{ 
              position: "absolute", 
              top: "50%", left: "50%",
              transform: "translate( -50%, -50% )",
              width: "85%", height: "65%", 
              pointerEvents: "auto", 
              zIndex: 10, 
              bgcolor: "transparent",
              cursor: "pointer"
            }} 
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback();
            }}
          />

          <Box
            className="player-overlay"
            sx={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              pointerEvents: "none",
              opacity: 0,
              transition: "opacity 0.3s ease",
              zIndex: 11, // Above shields for interaction
              "&:hover": { opacity: 1 },
              "&.visible": { opacity: 1 },
            }}
          >
            {/* Right Side Utility Controls */}
            <Box 
              sx={{ 
                position: "absolute", 
                top: "50%", 
                right: isMobile ? 8 : 12,
                transform: "translateY(-50%)",
                pointerEvents: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                zIndex: 12
              }}
            >
               {isMobile && (
                 <IconButton 
                   onClick={toggleRotate} 
                   sx={{ 
                     color: "#fff", 
                     width: isMobile ? 32 : 38,
                     height: isMobile ? 32 : 38,
                     backgroundColor: isMobile ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.45)", 
                     backdropFilter: "blur(6px)",
                     border: "1px solid rgba(255,255,255,0.05)",
                     "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                     transition: "all 0.2s ease"
                   }}
                 >
                    <ScreenRotationIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
                 </IconButton>
               )}
            </Box>
          </Box>
        </Box>

        {/* Attribution Row */}
        <Box sx={{ px: { xs: 2, md: 0 }, mb: 1.5, display: "flex", alignItems: "center", gap: 1, opacity: 0.6 }}>
           <Typography sx={{ fontSize: "0.75rem", color: metaColor, fontWeight: 500 }}>
             Content provided by YouTube
           </Typography>
        </Box>

        {/* Video Info Container */}
        <Box sx={{ px: { xs: 2, md: 0 }, className: "fade-in" }}>
          <Typography
            sx={{
              fontSize: { xs: "1.2rem", md: "1.7rem" },
              fontWeight: 700,
              color: textColor,
              lineHeight: 1.3,
              mb: 2.5,
              letterSpacing: "-0.6px",
            }}
          >
            {selectedVideo.title}
          </Typography>

          {/* Channel & Main Actions */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 2.5,
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  background: "linear-gradient(45deg, #ff0000, #ff5f6d)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  boxShadow: isDark ? "0 4px 12px rgba(255,0,0,0.25)" : "none",
                }}
              >
                {selectedVideo.subTitle.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: textColor, lineHeight: 1.2 }}>
                  {selectedVideo.subTitle}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: metaColor, fontWeight: 500 }}>
                  1.24M subscribers
                </Typography>
              </Box>
              <Button
                variant="contained"
                sx={{
                  ml: 1.5,
                  borderRadius: "24px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2.5,
                  py: 0.6,
                  fontSize: "0.85rem",
                  backgroundColor: isDark ? "#fff" : "#000",
                  color: isDark ? "#000" : "#fff",
                  "&:hover": { backgroundColor: isDark ? "#eee" : "#222", transform: "translateY(-1px)" },
                  transition: "all 0.2s ease",
                }}
              >
                Subscribe
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                overflowX: "auto",
                pb: { xs: 1, sm: 0 },
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
               <Box sx={{ display: "flex", backgroundColor: glassBg, borderRadius: "32px", border: `1px solid ${glassBorder}`, overflow: "hidden", backdropFilter: "blur(10px)" }}>
                  <Button
                    onClick={() => setLiked(!liked)}
                    startIcon={liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                    sx={{ color: textColor, px: 2.5, borderRight: `1px solid ${glassBorder}`, borderRadius: 0, textTransform: "none", fontWeight: 700 }}
                  >
                    {liked ? "12K" : "11K"}
                  </Button>
                  <IconButton sx={{ color: textColor, px: 2, borderRadius: 0 }}>
                    <ThumbDownOutlinedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
               </Box>

               <Button
                startIcon={<ShareIcon />}
                sx={{
                  backgroundColor: glassBg,
                  borderRadius: "32px",
                  border: `1px solid ${glassBorder}`,
                  color: textColor,
                  px: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(10px)",
                }}
              >
                Share
              </Button>

              <Button
                startIcon={<DownloadIcon />}
                sx={{
                  backgroundColor: glassBg,
                  borderRadius: "32px",
                  border: `1px solid ${glassBorder}`,
                  color: textColor,
                  px: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  display: { xs: "none", md: "flex" },
                  backdropFilter: "blur(10px)",
                }}
              >
                Download
              </Button>

              <IconButton sx={{ backgroundColor: glassBg, border: `1px solid ${glassBorder}`, color: textColor, backdropFilter: "blur(10px)" }}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Description Glass Card */}
          <Box
            sx={{
              p: 3,
              backgroundColor: glassBg,
              borderRadius: "20px",
              border: `1px solid ${glassBorder}`,
              backdropFilter: "blur(20px)",
              mb: 5,
              transition: "all 0.3s ease",
              "&:hover": { borderColor: "rgba(255,255,255,0.15)" },
            }}
          >
            <Box sx={{ display: "flex", gap: 2, mb: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 800, color: textColor, fontSize: "0.95rem" }}>{selectedVideo.viewCount || "1.2M"} views</Typography>
              <Typography sx={{ fontWeight: 800, color: textColor, fontSize: "0.95rem" }}>{selectedVideo.publishedAt ? new Date(selectedVideo.publishedAt).toLocaleDateString() : "2 days ago"}</Typography>
              <Box display="flex" gap={1}>
                 {["#trending", "#premium", "#tomtube"].map(tag => (
                   <Typography key={tag} sx={{ color: "#3ea6ff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>{tag}</Typography>
                 ))}
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: "1rem",
                lineHeight: 1.7,
                color: textColor,
                whiteSpace: "pre-wrap",
                opacity: 0.85,
                fontWeight: 400,
              }}
            >
              {selectedVideo.description || selectedVideo.subTitle + " brings you another high-quality video experience. Optimized for premium viewing. Don't forget to like and subscribe for more amazing content!"}
            </Typography>
            <Button sx={{ p: 0, mt: 2, color: textColor, fontWeight: 600, textTransform: "none", opacity: 0.9 }}>Show more</Button>
          </Box>

          {/* Comments Section */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 4, mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.2rem" }}>842 Comments</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: textColor, cursor: "pointer", opacity: 0.8, "&:hover": { opacity: 1 } }}>
                <SortIcon />
                <Typography sx={{ fontWeight: 600 }}>Sort by</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2.5, mb: 5 }}>
              <Avatar sx={{ width: 44, height: 44, background: "linear-gradient(135deg, #ff4d4d, #ff0000)", fontWeight: 900 }}>T</Avatar>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Add a comment..."
                  InputProps={{
                    disableUnderline: false,
                    sx: { fontSize: "1rem", pb: 1, fontWeight: 500 }
                  }}
                  sx={{ "& .MuiInput-underline:before": { borderColor: glassBorder }, "& .MuiInput-underline:after": { borderColor: "#ff4d4d" } }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5, gap: 1.5 }}>
                   <Button size="small" sx={{ textTransform: "none", color: textColor, fontWeight: 700 }}>Cancel</Button>
                   <Button size="small" variant="contained" disabled sx={{ textTransform: "none", borderRadius: "20px", px: 2, fontWeight: 700 }}>Comment</Button>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {dummyComments.map((comment) => (
                <Box key={comment.id} sx={{ display: "flex", gap: 2.5 }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: `hsl(${comment.id * 120}, 65%, 45%)`, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                    {comment.avatar}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.8 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>@{comment.user.replace(" ", "").toLowerCase()}</Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: metaColor, fontWeight: 500 }}>{comment.time}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "1rem", color: textColor, mb: 1.5, lineHeight: 1.6, opacity: 0.9 }}>
                      {comment.text}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <IconButton size="small" sx={{ p: 0.5, color: textColor }}>
                          <ThumbUpOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Typography sx={{ fontSize: "0.8rem", color: metaColor, fontWeight: 700 }}>{comment.likes}</Typography>
                      </Box>
                      <IconButton size="small" sx={{ p: 0.5, color: textColor }}>
                        <ThumbDownOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", ml: 1, opacity: 0.8, "&:hover": { opacity: 1 } }}>Reply</Typography>
                    </Box>
                    {comment.replies > 0 && (
                       <Button startIcon={<SendIcon sx={{ transform: "rotate(90deg)", fontSize: 14 }} />} sx={{ mt: 1.5, textTransform: "none", fontSize: "0.9rem", fontWeight: 800, color: "#3ea6ff", p: 0 }}>
                          View {comment.replies} replies
                       </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── RIGHT COLUMN: PLAYLISTS ── */}
      <Box
        sx={{
          width: isMobile ? "100%" : "440px",
          flexShrink: 0,
          zIndex: 1,
          p: { xs: 2, md: 0 },
          position: "relative",
        }}
      >
        <Box sx={{ position: "sticky", top: "10px" }}>
          {/* Controls Hook */}
          <Box 
            sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                mb: 3, 
                px: 2,
                py: 1.5,
                backgroundColor: glassBg,
                borderRadius: "16px",
                border: `1px solid ${glassBorder}`,
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease"
            }}
          >
             <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.3px", color: textColor }}>Up Next</Typography>
             
             <Box sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", px: 1.5, py: 0.5, borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Typography sx={{ fontSize: "11px", fontWeight: 800, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", letterSpacing: "1px" }}>AUTOPLAY</Typography>
                <Switch 
                  size="small" 
                  checked={autoPlayEnabled} 
                  onChange={(e) => setAutoPlayEnabled(e.target.checked)}
                  sx={{ 
                    "& .MuiSwitch-switchBase.Mui-checked": { color: accentRed },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: accentRed },
                  }} 
                />
             </Box>
          </Box>

          {/* Series Playlist */}
          {seriesPlaylist.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Box sx={{ backgroundColor: "rgba(255,255,255,0.05)", p: 2, borderRadius: "20px 20px 0 0", borderBottom: `2px solid #ff4d4d`, backdropFilter: "blur(10px)" }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#ff4d4d", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Series Episodes
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, backgroundColor: glassBg, borderRadius: "0 0 20px 20px", border: `1px solid ${glassBorder}`, borderTop: "none", overflow: "hidden", backdropFilter: "blur(20px)" }}>
                {seriesPlaylist.slice(0, 10).map((video) => renderVideoRow(video, true))}
              </Box>
            </Box>
          )}

          {/* Recommended Section */}
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 2.5, pl: 1 }}>Recommended</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {playlist.map((video) => renderVideoRow(video, false))}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  function renderVideoRow(video: YouTubeVideoInfo, isSeries: boolean) {
    const isCurrent = video.id === id;
    
    return (
      <Box
        key={`${isSeries ? "s" : "p"}-${video.id}`}
        onClick={() => navigate(`/video/${video.id}`)}
        sx={{
          display: "flex",
          gap: 2,
          cursor: "pointer",
          p: 1.2,
          borderRadius: "16px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: isCurrent ? "rgba(255,77,77,0.1)" : "transparent",
          "&:hover": {
            backgroundColor: isCurrent ? "rgba(255,77,77,0.15)" : cardHover,
            transform: "scale(1.02)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          },
          ...(isSeries && { p: 1.8 }),
        }}
      >
        <Box sx={{ flexShrink: 0, width: isSeries ? 130 : 180, aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden", position: "relative", boxShadow: isDark ? "0 6px 15px rgba(0,0,0,0.3)" : "none" }}>
          <Box component="img" src={video.thumbnail} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <Box sx={{ position: "absolute", bottom: 6, right: 6, backgroundColor: "rgba(0,0,0,0.85)", color: "#fff", px: 0.8, py: 0.3, borderRadius: "6px", fontSize: "11px", fontWeight: 800, backdropFilter: "blur(4px)" }}>
            {video.duration || "4:32"}
          </Box>
          {isCurrent && (
            <Box sx={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
              <PlayArrowIcon sx={{ color: "#fff", fontSize: 32 }} />
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.95rem",
              color: isCurrent ? "#ff4d4d" : textColor,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 0.8,
            }}
          >
            {video.title}
          </Typography>
          <Typography sx={{ color: metaColor, fontSize: "0.75rem", fontWeight: 700, mb: 0.5 }}>{video.subTitle}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ color: metaColor, fontSize: "0.75rem", fontWeight: 500 }}>{video.viewCount || "1.2M"} views</Typography>
            <Typography sx={{ color: metaColor, fontSize: "0.7rem", opacity: 0.5 }}>•</Typography>
            <Typography sx={{ color: metaColor, fontSize: "0.75rem", fontWeight: 500 }}>2 days ago</Typography>
          </Box>
        </Box>
      </Box>
    );
  }
};

export default VideoPage;
