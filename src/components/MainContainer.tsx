import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Chip,
  CircularProgress,
  Avatar,
  IconButton,
  Button,
  Switch,
} from "@mui/material";
import { useThemeMode } from "./ThemeContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { useNavigate } from "react-router-dom";
import { fetchVideosByCategory, fetchPopularVideos } from "../api/youtube";
import type { YouTubeVideoInfo } from "../api/youtube";

interface MainContentProps {
  isSidebarExpanded: boolean;
}

interface HomeSections {
  [key: string]: YouTubeVideoInfo[];
}

const VideoCard: React.FC<{ video: YouTubeVideoInfo; titleColor: string; metaColor: string; compact?: boolean }> = ({ video, titleColor, metaColor, compact }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [imgError, setImgError] = React.useState(false);

  return (
    <Box
      onClick={() => navigate(`/video/${video.id}`)}
      sx={{
        cursor: "pointer",
        minWidth: compact ? { xs: "200px", sm: "320px" } : "auto",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "&:hover": { 
          transform: "translateY(-6px) scale(1.02)",
          "& .thumbnail-overlay": { opacity: 1 },
          "& .card-glow": { opacity: 0.1 },
          boxShadow: isDark ? "0 12px 28px rgba(0,0,0,0.5)" : "none",
        },
      }}
    >
      <Box sx={{ position: "relative", mb: 1.5 }}>
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
            position: "relative",
            boxShadow: isDark ? "0 8px 30px rgba(0,0,0,0.3)" : "none",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!imgError ? (
            <Box
              component="img"
              src={video.thumbnail}
              alt={video.title}
              onError={() => setImgError(true)}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <VideoLibraryIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.2)" }} />
          )}
          {/* Subtle Hover Glow */}
          <Box
            className="card-glow"
            sx={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at center, #ff0000 0%, transparent 70%)",
              opacity: 0,
              transition: "opacity 0.4s ease",
            }}
          />
          {/* Overlay on hover */}
          <Box
            className="thumbnail-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.3s ease",
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 40, color: "#fff", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))" }} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              right: 10,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
              color: "#fff",
              px: 1,
              py: 0.4,
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            12:45
          </Box>
        </Box>
      </Box>

      <Box display="flex" gap={1.5}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, #ff3d00, #dd2c00)",
            fontSize: "12px",
            fontWeight: 800,
            border: "2px solid rgba(255,255,255,0.1)",
            boxShadow: isDark ? "0 4px 10px rgba(0,0,0,0.2)" : "none",
          }}
        >
          {video.subTitle.charAt(0)}
        </Avatar>
        <Box flex={1}>
          <Typography
            sx={{
              color: titleColor,
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: 1.3,
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.title}
          </Typography>
          <Typography sx={{ color: metaColor, fontSize: "12px", fontWeight: 500, mb: 0.2 }}>
            {video.subTitle}
          </Typography>
          <Typography sx={{ color: metaColor, fontSize: "11px", opacity: 0.8 }}>
            1.2M views • 2 hours ago
          </Typography>
        </Box>
        <IconButton size="small" sx={{ p: 0.5, height: "fit-content", color: metaColor, opacity: 0.5, "&:hover": { opacity: 1 } }}>
          <MoreVertIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

const MainContent: React.FC<MainContentProps> = ({ isSidebarExpanded }) => {
  const [videoData, setVideoData] = useState<YouTubeVideoInfo[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSections>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const { primaryColor } = useThemeMode();
  const [autoplay, setAutoplay] = useState(true);
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const carouselRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const [showCategoryLeft, setShowCategoryLeft] = useState(false);
  const [showCategoryRight, setShowCategoryRight] = useState(true);
  const [carouselVisibility, setCarouselVisibility] = useState<{ [key: string]: { left: boolean; right: boolean } }>({});

  const checkVisibility = (element: HTMLDivElement | null) => {
    if (!element) return { left: false, right: false };
    const { scrollLeft, scrollWidth, clientWidth } = element;
    return {
      left: scrollLeft > 10,
      right: scrollLeft + clientWidth < scrollWidth - 10
    };
  };

  const updateCategoryArrows = () => {
    const visibility = checkVisibility(categoryScrollRef.current);
    setShowCategoryLeft(visibility.left);
    setShowCategoryRight(visibility.right);
  };

  const updateCarouselArrows = (title: string) => {
    const visibility = checkVisibility(carouselRefs.current[title]);
    setCarouselVisibility(prev => ({
      ...prev,
      [title]: visibility
    }));
  };

  const handleScroll = (element: HTMLDivElement | null, direction: 'left' | 'right') => {
    if (element) {
      const scrollAmount = element.clientWidth * 0.6;
      element.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    updateCategoryArrows();
    Object.keys(homeSections).forEach(title => updateCarouselArrows(title));
    
    window.addEventListener('resize', updateCategoryArrows);
    return () => window.removeEventListener('resize', updateCategoryArrows);
  }, [homeSections]);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      if (selectedCategory === "All") {
        try {
          const [trending, music] = await Promise.all([
            fetchPopularVideos(12, 'BD'),
            fetchVideosByCategory("Bangla Song Hit", 12),
          ]);
          setHomeSections({
            "Trending Now": trending,
            "Music Corner": music,
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        const data = await fetchVideosByCategory(selectedCategory, 24);
        setVideoData(data);
      }
      setLoading(false);
    };
    loadVideos();
  }, [selectedCategory]);

  const sidebarWidth = isMobile ? 0 : (isSidebarExpanded ? 242 : 104);

  const metaColor = isDark ? "#888888" : "#606060";
  const titleColor = isDark ? "#ffffff" : "#0f0f0f";

  const heroVideo = homeSections["Trending Now"]?.[0];

  return (
    <Box
      sx={{
        marginLeft: `${sidebarWidth}px`,
        marginTop: "88px",
        marginRight: isMobile ? 0 : "8px",
        marginBottom: isMobile ? "80px" : "8px",
        minHeight: "calc(100vh - 100px)",
        borderRadius: isMobile ? 0 : "32px",
        backgroundColor: isDark ? "#080808" : "#ffffff",
        border: isMobile ? "none" : (isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)"),
        boxShadow: isMobile ? "none" : (isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "none"),
        backgroundImage: isDark 
          ? "radial-gradient(circle at 50% -20%, rgba(255,0,0,0.05) 0%, transparent 50%)" 
          : "radial-gradient(circle at 50% -20%, rgba(255,0,0,0.03) 0%, transparent 40%)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        px: { xs: 1.5, sm: 2, md: 4 },
        pt: 2,
        pb: 4,
        overflowX: "hidden",
        position: "relative",
        "@media (orientation: landscape) and (max-height: 500px)": {
          marginTop: 0,
          marginLeft: "0 !important",
          marginRight: 0,
          borderRadius: 0,
        },
      }}
    >
      {/* Dynamic Category Chips */}
      <Box sx={{ position: "relative", mx: { xs: -1.5, sm: -2, md: -3 } }}>
        <Box
          ref={categoryScrollRef}
          onScroll={updateCategoryArrows}
          sx={{
            position: "sticky",
            top: "64px",
            zIndex: 100,
            backgroundColor: isDark ? "rgba(8,8,8,0.8)" : "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            py: 2,
            mb: 1,
            px: { xs: 1.5, sm: 2, md: 3 },
            overflowX: "auto",
            display: "flex",
            gap: 1,
            "&::-webkit-scrollbar": { display: "none" }, // Safari and Chrome
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE and Edge
            scrollBehavior: "smooth",
          }}
        >
          {["All", "Songs", "Hindi", "Gaming", "News", "Movies", "Tech", "Cooking", "vlogs"].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                height: 34,
                px: 1.2,
                backgroundColor: selectedCategory === cat ? (isDark ? "#fff" : "#000") : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                color: selectedCategory === cat ? (isDark ? "#000" : "#fff") : (isDark ? "#fff" : "#000"),
                fontWeight: 600,
                fontSize: "13px",
                "&:hover": { 
                  backgroundColor: selectedCategory === cat 
                    ? "#fff" 
                    : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"),
                  transform: "translateY(-1px)"
                },
                borderRadius: "20px",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                border: selectedCategory === cat ? "none" : (isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)"),
                flexShrink: 0,
              }}
            />
          ))}

          {/* Autoplay Toggle Segment */}
          {!isMobile && (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", px: 1.5, py: 0.5, borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
               <Typography sx={{ fontSize: "11px", fontWeight: 800, color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", letterSpacing: "1px" }}>AUTOPLAY</Typography>
               <Switch 
                 size="small" 
                 checked={autoplay} 
                 onChange={(e) => setAutoplay(e.target.checked)}
                 sx={{ 
                   "& .MuiSwitch-switchBase.Mui-checked": { color: primaryColor },
                   "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: primaryColor },
                 }} 
               />
            </Box>
          )}
        </Box>
        {/* Left Arrow Button for Categories */}
        {showCategoryLeft && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: "53%",
              transform: "translateY(-50%)",
              height: "100%",
              zIndex: 101,
              display: "flex",
              alignItems: "center",
              background: isDark 
                ? "linear-gradient(to left, transparent 0%, #080808 80%)" 
                : "linear-gradient(to left, transparent 0%, #ffffff 80%)",
              pr: { xs: 3, md: 4.5 },
              pl: 0.5
            }}
          >
            <IconButton 
              size="small" 
              onClick={() => handleScroll(categoryScrollRef.current, 'left')}
              sx={{ 
                bgcolor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
                color: isDark ? "#fff" : "#000",
                width: { xs: 24, sm: 32 },
                height: { xs: 24, sm: 32 },
                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)" }
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </IconButton>
          </Box>
        )}

        {/* Right Arrow Button for Categories */}
        {showCategoryRight && (
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: "53%",
              transform: "translateY(-50%)",
              height: "100%",
              zIndex: 101,
              display: "flex",
              alignItems: "center",
              background: isDark 
                ? "linear-gradient(to right, transparent 0%, #080808 80%)" 
                : "linear-gradient(to right, transparent, #ffffff 80%)",
              pl: { xs: 3, md: 4.5 },
              pr: 0.5
            }}
          >
            <IconButton 
              size="small" 
              onClick={() => handleScroll(categoryScrollRef.current, 'right')}
              sx={{ 
                bgcolor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
                color: isDark ? "#fff" : "#000",
                width: { xs: 24, sm: 32 },
                height: { xs: 24, sm: 32 },
                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)" }
              }}
            >
              <ChevronRightIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: "#ff0000" }} /></Box>
      ) : selectedCategory === "All" ? (
        <Box mt={1}>
          {/* Compact Hero Banner */}
          {heroVideo && (
            <Box
              sx={{
                width: "100%",
                height: { xs: 240, md: 440 },
                borderRadius: "32px",
                overflow: "hidden",
                position: "relative",
                mb: 6,
                cursor: "pointer",
                boxShadow: isDark ? "0 25px 60px rgba(0,0,0,0.6)" : "none",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)",
                backgroundColor: isDark ? "#000" : "#fff",
              }}
              onClick={() => navigate(`/video/${heroVideo.id}`)}
            >
              <Box component="img" src={heroVideo.thumbnail} sx={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.05)", filter: isDark ? "brightness(0.65)" : "brightness(0.95)" }} />
              <Box sx={{
                position: "absolute",
                inset: 0,
                background: isDark 
                  ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)"
                  : "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 40%)",
                p: { xs: 3, md: 7 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end"
              }}>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ff4d4d", boxShadow: "0 0 10px #ff0000" }} />
                  <Typography sx={{ color: "#ff4d4d", fontWeight: 700, fontSize: "14px", letterSpacing: 2.5, textTransform: "uppercase" }}>Trending Selection</Typography>
                </Box>
                <Typography sx={{ 
                  color: isDark ? "#fff" : "#000", 
                  fontSize: { xs: "28px", md: "48px" }, 
                  fontWeight: 700, 
                  maxWidth: "900px", 
                  lineHeight: 1, 
                  mb: 4, 
                  textShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
                  letterSpacing: "-1px"
                }}>
                  {heroVideo.title}
                </Typography>
                <Box display="flex" gap={1.5} flexWrap={isMobile ? "wrap" : "nowrap"}>
                  <Button 
                    variant="contained" 
                    size={isMobile ? "medium" : "large"} 
                    startIcon={<PlayArrowIcon />} 
                    sx={{ 
                      bgcolor: isDark ? "#fff" : "#000", 
                      color: isDark ? "#000" : "#fff", 
                      fontWeight: 800, 
                      px: { xs: 2.5, md: 5 }, 
                      py: { xs: 1, md: 1.5 }, 
                      borderRadius: "12px", 
                      "&:hover": { bgcolor: isDark ? "#eee" : "#333", transform: "scale(1.05)" }, 
                      transition: "all 0.3s", 
                      textTransform: "none", 
                      fontSize: { xs: "14px", md: "17px" } 
                    }}
                  >
                    Watch Video
                  </Button>
                  <Button 
                    variant="contained" 
                    size={isMobile ? "medium" : "large"} 
                    sx={{ 
                      bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", 
                      backdropFilter: "blur(15px)", 
                      color: isDark ? "#fff" : "#000", 
                      fontWeight: 700, 
                      px: { xs: 2, md: 4 }, 
                      borderRadius: "12px", 
                      "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)", transform: "scale(1.05)" }, 
                      transition: "all 0.3s", 
                      textTransform: "none", 
                      fontSize: { xs: "14px", md: "17px" }, 
                      border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)" 
                    }}
                  >
                    Add to Library
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* High-Density Row Carousels */}
          {Object.entries(homeSections).map(([title, videos]) => (
            <Box key={title} mb={4} sx={{ position: "relative" }}>
              <Typography sx={{ color: titleColor, fontWeight: 700, mb: 2, fontSize: "18px", letterSpacing: -0.5 }}>{title}</Typography>
              <Box
                ref={(el: HTMLDivElement | null) => { carouselRefs.current[title] = el; }}
                onScroll={() => updateCarouselArrows(title)}
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  pb: 1,
                  px: 0.5,
                  "&::-webkit-scrollbar": { display: "none" }, // Safari and Chrome
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE and Edge
                  scrollBehavior: "smooth"
                }}
              >
                {videos.map((video) => (
                  <VideoCard key={video.id + title} video={video} titleColor={titleColor} metaColor={metaColor} compact />
                ))}
              </Box>

              {/* Left Arrow Button for Carousels */}
              {carouselVisibility[title]?.left && (
                <Box
                  sx={{
                    position: "absolute",
                    left: -10,
                    top: "60%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    height: "120px",
                    background: isDark 
                      ? "linear-gradient(to left, transparent 0%, #080808 85%)" 
                      : "linear-gradient(to left, transparent 0%, #ffffff 85%)",
                    pr: { xs: 4, sm: 8 },
                    pl: 0.5
                  }}
                >
                  <IconButton 
                    onClick={() => handleScroll(carouselRefs.current[title], 'left')}
                    sx={{ 
                      bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                      color: isDark ? "#fff" : "#000",
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      "&:hover": { 
                        bgcolor: isDark ? "#fff" : "#000",
                        color: isDark ? "#000" : "#fff",
                        transform: "scale(1.1)"
                      },
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      transition: "all 0.2"
                    }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </IconButton>
                </Box>
              )}

              {/* Right Arrow Button for Carousels */}
              {carouselVisibility[title]?.right !== false && (
                <Box
                  sx={{
                    position: "absolute",
                    right: -10,
                    top: "60%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    height: "120px",
                    background: isDark 
                      ? "linear-gradient(to right, transparent 0%, #080808 85%)" 
                      : "linear-gradient(to right, transparent 0%, #ffffff 85%)",
                    pl: { xs: 4, sm: 8 },
                    pr: 0.5
                  }}
                >
                  <IconButton 
                    onClick={() => handleScroll(carouselRefs.current[title], 'right')}
                    sx={{ 
                      bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
                      color: isDark ? "#fff" : "#000",
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      "&:hover": { 
                        bgcolor: isDark ? "#fff" : "#000",
                        color: isDark ? "#000" : "#fff",
                        transform: "scale(1.1)"
                      },
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      transition: "all 0.2"
                    }}
                  >
                    <ChevronRightIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </IconButton>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Box mt={2} sx={{ width: "100%" }}>
          <Typography sx={{ color: titleColor, fontWeight: 700, mb: 3, fontSize: "20px", letterSpacing: -0.5 }}>{selectedCategory}</Typography>
          <Grid container spacing={3}>
            {videoData.map((video) => (
              <Grid key={video.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                <VideoCard video={video} titleColor={titleColor} metaColor={metaColor} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default MainContent;
