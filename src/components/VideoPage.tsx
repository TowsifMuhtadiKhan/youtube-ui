import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  Avatar,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import videoData from "./data.json";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ShareIcon from "@mui/icons-material/Share";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import YouTubeIcon from "@mui/icons-material/YouTube";

interface VideoPageProps {
  isSidebarExpanded: boolean;
}

const PLAYLIST_ROW_HEIGHT = 88;

const VideoPage: React.FC<VideoPageProps> = ({ isSidebarExpanded }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const sidebarWidth = isMobile ? 0 : isSidebarExpanded ? 232 : 72;
  const baseBg = isDark ? "#080808" : "#f0f0f0";
  // Panels use semi-transparent backgrounds so ambient color bleeds through
  const panelBg = isDark ? "rgba(10,10,10,0.72)" : "rgba(248,248,248,0.75)";
  const cardHoverBg = isDark ? "rgba(40,40,40,0.85)" : "rgba(230,230,230,0.85)";
  const rightPanelBg = isDark ? "rgba(15,15,15,0.80)" : "rgba(240,240,240,0.80)";
  const headerBg = isDark ? "rgba(12,12,12,0.85)" : "rgba(235,235,235,0.85)";

  const textColor = isDark ? "#f1f1f1" : "#0f0f0f";
  const metaColor = isDark ? "#aaaaaa" : "#606060";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const activeRowBg = isDark ? "rgba(255,0,0,0.12)" : "rgba(255,0,0,0.06)";
  const btnBg = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)";
  const btnHoverBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

  const selectedVideo = videoData.find((v) => v.id === id);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      // Auto-landscape on mobile when fullscreen is active
      if (isMobile) {
        if (active) {
          try { (screen.orientation as any).lock("landscape"); } catch { /* ignore */ }
        } else {
          try { (screen.orientation as any).unlock(); } catch { /* ignore */ }
          setIsRotated(false);
        }
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [isMobile]);

  // Mobile: fullscreen + rotate 90° for landscape viewing
  const toggleRotate = async () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      await playerContainerRef.current.requestFullscreen();
      // Our existing useEffect[isMobile, active] will detect this and lock landscape
      setIsRotated(true);
    } else {
      document.exitFullscreen();
      // Our existing useEffect will unlock landscape and set isRotated(false)
    }
  };



  if (!selectedVideo) {
    return (
      <Box
        sx={{
          marginLeft: `${sidebarWidth}px`,
          marginTop: "64px",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: baseBg,
        }}
      >
        <Box textAlign="center">
          <PlayCircleOutlineIcon sx={{ fontSize: 72, color: "#444", mb: 2 }} />
          <Typography sx={{ color: metaColor, fontSize: "18px", fontWeight: 600 }}>
            Video not found
          </Typography>
        </Box>
      </Box>
    );
  }

  const videoIndex = videoData.findIndex((v) => v.id === id);

  const handlePrevious = () => {
    if (videoIndex > 0) navigate(`/video/${videoData[videoIndex - 1].id}`);
  };
  const handleNext = () => {
    if (videoIndex < videoData.length - 1)
      navigate(`/video/${videoData[videoIndex + 1].id}`);
  };

  useEffect(() => {
    // Only used to trigger next video if autoplay is manually toggled on
  }, [id, autoPlayEnabled]);

  return (
    <Box
      sx={{
        marginLeft: `${sidebarWidth}px`,
        marginTop: "64px",
        /* Global single scroll */
        minHeight: "calc(100vh - 64px)",
        backgroundColor: baseBg,
        transition: "margin-left 0.25s ease, background-color 0.3s ease",
        display: "flex",
        flexDirection: isTablet ? "column" : "row",
        position: "relative",
      }}
    >
      {/* ── GLOBAL ambient thumbnail layer — Fixed to cover viewport ── */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${selectedVideo.thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(80px) saturate(1.6) brightness(0.5)",
          transform: "scale(1.15)",
          opacity: isDark ? 0.55 : 0.28,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Dark vignette overlay */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)"
            : "radial-gradient(ellipse at center, transparent 30%, rgba(255,255,255,0.45) 100%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* ─────────────────── LEFT: Player + Details ─────────────────── */}
      <Box
        sx={{
          flex: isTablet ? "none" : "1 1 0",
          display: "flex",
          flexDirection: "column",
          width: isTablet ? "100%" : "auto",
          height: "auto",
          /* Semi-transparent so global ambient shows through */
          backgroundColor: panelBg,
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 1,
        }}
      >
        <Box
          ref={playerContainerRef}
          sx={{
            position: "relative",
            backgroundColor: "#000",
            flexShrink: 0,
            mt: { xs: 0, md: 2 },
            mx: { xs: 0, sm: 2, md: 4 },
            borderRadius: isFullscreen || isRotated ? 0 : { xs: 0, md: "16px" },
            overflow: "hidden",
            boxShadow: isFullscreen || isRotated ? "none" : "0 12px 48px rgba(0,0,0,0.5)",
            zIndex: isFullscreen || isRotated ? 9999 : 10,
            /* When rotated on mobile, use CSS transform to simulate landscape */
            ...(isRotated && {
              transform: "rotate(90deg)",
              transformOrigin: "center center",
              width: "100vh",
              height: "100vw",
              position: "fixed",
              top: "50%",
              left: "50%",
              marginTop: "-50vw",
              marginLeft: "-50vh",
            }),
            "&:hover .fullscreen-btn": { opacity: "1 !important" },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              paddingTop: isFullscreen || isRotated ? 0 : (isMobile ? "65%" : "56.25%"),
              height: isFullscreen || isRotated ? "100vh" : 0,
              overflow: "hidden",
            }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${id}?rel=0&autoplay=1&enablejsapi=1&modestbranding=1&iv_load_policy=3&showinfo=0&color=white&fs=0`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
            />
            {/* Block clicks on top-left title/channel text */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "65%",
                height: "52px",
                zIndex: 20,
                cursor: "default",
              }}
            />
            {/* Solid overlay bar at the bottom — hides "More Videos" + YouTube logo
                without affecting iframe height or settings popup */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "38px",
                background: "#000",
                zIndex: 20,
              }}
            />
            {/* Dedicated Exit button floating inside the video, only visible during fullscreen/rotate */}
            {(isFullscreen || isRotated) && (
              <IconButton
                onClick={() => {
                  if (isRotated) toggleRotate();
                  else if (isFullscreen) toggleFullscreen();
                }}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 30,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(4px)",
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                  width: 44,
                  height: 44,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
              >
                <FullscreenExitIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* ── Details ── */}
        <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5, flex: 1 }}>
          {/* Title row with fullscreen button */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
            <Typography
              sx={{
                color: textColor,
                fontWeight: 800,
                fontSize: { xs: "17px", md: "22px" },
                lineHeight: 1.35,
                letterSpacing: "-0.4px",
                flex: 1,
              }}
            >
              {selectedVideo.title}
            </Typography>
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                color: textColor,
                backgroundColor: btnBg,
                "&:hover": { backgroundColor: btnHoverBg },
                width: 36,
                height: 36,
                flexShrink: 0,
                mt: 0.5,
              }}
            >
              {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
            {/* Rotate button — mobile only */}
            {isMobile && (
              <IconButton
                onClick={toggleRotate}
                sx={{
                  color: isRotated ? "#ff4444" : textColor,
                  backgroundColor: btnBg,
                  "&:hover": { backgroundColor: btnHoverBg },
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  mt: 0.5,
                }}
              >
                <ScreenRotationIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Channel + actions row */}
          <Box
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            alignItems={isMobile ? "flex-start" : "center"}
            justifyContent="space-between"
            gap={2}
            mb={2.5}
          >
            <Box display="flex" alignItems="center" gap={isMobile ? 1 : 1.5}>
              <Avatar
                sx={{
                  width: isMobile ? 34 : 42,
                  height: isMobile ? 34 : 42,
                  fontSize: isMobile ? "15px" : "17px",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #ff0000, #cc2200)",
                  flexShrink: 0,
                }}
              >
                T
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: isMobile ? "14px" : "15px", color: textColor }}>
                  TomTube Channel
                </Typography>
                <Typography sx={{ fontSize: isMobile ? "12px" : "13px", color: metaColor }}>
                  {videoIndex + 1} of {videoData.length}
                </Typography>
              </Box>
            </Box>

            {/* Action buttons container */}
            <Box
              sx={{
                width: isMobile ? "100%" : "auto",
                overflow: "hidden" // Container prevents layout break
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  pb: isMobile ? 1 : 0,
                  // Enable horizontal scroll on mobile ONLY
                  overflowX: isMobile ? "auto" : "visible",
                  whiteSpace: "nowrap",
                  // Hide scrollbar but keep functionality
                  "&::-webkit-scrollbar": { display: "none" },
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {/* Like / Dislike Group */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: btnBg,
                    borderRadius: "20px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      px: 2,
                      py: 0.8,
                      borderRadius: 0,
                      gap: 1,
                      color: textColor,
                      "&:hover": { backgroundColor: btnHoverBg },
                      borderRight: `1px solid ${borderColor}`,
                    }}
                  >
                    <ThumbUpOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>Like</Typography>
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      px: 1.5,
                      py: 0.8,
                      borderRadius: 0,
                      color: textColor,
                      "&:hover": { backgroundColor: btnHoverBg },
                    }}
                  >
                    <ThumbDownOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {[
                  { icon: <ShareIcon sx={{ fontSize: 17 }} />, label: "Share" },
                  { icon: <BookmarkBorderIcon sx={{ fontSize: 17 }} />, label: "Save" },
                ].map(({ icon, label }) => (
                  <IconButton
                    key={label}
                    size="small"
                    sx={{
                      backgroundColor: btnBg,
                      borderRadius: "20px",
                      px: 2,
                      py: 0.8,
                      gap: 1,
                      color: textColor,
                      height: "36px",
                      flexShrink: 0,
                      "&:hover": { backgroundColor: btnHoverBg },
                    }}
                  >
                    {icon}
                    <Typography sx={{ fontSize: "13px", color: textColor, fontWeight: 600 }}>
                      {label}
                    </Typography>
                  </IconButton>
                ))}
              </Box>

              {/* YouTube badge — now fixed below with better spacing */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                  borderRadius: "20px",
                  px: 1.5,
                  py: 0.5,
                  mt: 1, // Space from scroll row
                  border: `1px solid ${borderColor}`,
                  cursor: "default",
                  userSelect: "none",
                  width: "fit-content",
                }}
              >
                <YouTubeIcon sx={{ fontSize: 16, color: "#ff0000" }} />
                <Typography sx={{ fontSize: "10px", color: metaColor, fontWeight: 700, letterSpacing: "0.2px", textTransform: "uppercase" }}>
                  Powered by YouTube
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor, mb: 2.5 }} />

          {/* Description */}
          <Box
            sx={{
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              borderRadius: "12px",
              p: 2.5,
              mb: 2.5,
            }}
          >
            <Typography sx={{ color: textColor, fontSize: "14px", lineHeight: 1.75 }}>
              {selectedVideo.subTitle}
            </Typography>
          </Box>

          {/* Navigation + autoplay */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
              pb: 2,
            }}
          >
            <Box display="flex" gap={1}>
              {[
                {
                  label: "Previous",
                  icon: <SkipPreviousIcon />,
                  disabled: videoIndex === 0,
                  action: handlePrevious,
                  position: "start" as const,
                },
                {
                  label: "Next",
                  icon: <SkipNextIcon />,
                  disabled: videoIndex === videoData.length - 1,
                  action: handleNext,
                  position: "end" as const,
                },
              ].map(({ label, icon, disabled, action, position }) => (
                <Button
                  key={label}
                  variant="outlined"
                  size="small"
                  disabled={disabled}
                  onClick={action}
                  startIcon={position === "start" ? icon : undefined}
                  endIcon={position === "end" ? icon : undefined}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderColor,
                    color: textColor,
                    backgroundColor: btnBg,
                    "&:hover": {
                      borderColor: isDark ? "#888" : "#555",
                      backgroundColor: btnHoverBg,
                    },
                    "&.Mui-disabled": {
                      borderColor,
                      color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={autoPlayEnabled}
                  onChange={() => setAutoPlayEnabled(!autoPlayEnabled)}
                  size="small"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#ff0000" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#ff0000",
                    },
                  }}
                />
              }
              label="Autoplay"
              labelPlacement="start"
              sx={{
                color: metaColor,
                mr: 0,
                gap: 0.5,
                "& .MuiFormControlLabel-label": { fontSize: "13px", fontWeight: 500 },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ─────────────────── RIGHT: Playlist ─────────────────── */}
      <Box
        sx={{
          width: isTablet ? "100%" : { md: 420, lg: 480 },
          flexShrink: 0,
          height: "auto",
          display: "flex",
          flexDirection: "column",
          backgroundColor: rightPanelBg,
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          borderLeft: isTablet ? "none" : `1px solid ${borderColor}`,
          borderTop: isTablet ? `1px solid ${borderColor}` : "none",
          zIndex: 1,
        }}
      >
        {/* Playlist header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: headerBg,
            position: "sticky",
            top: "64px",
            zIndex: 5,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "16px", color: textColor }}>
              Up Next
            </Typography>
            <Typography sx={{ fontSize: "13px", color: metaColor, mt: 0.25 }}>
              {videoIndex + 1} / {videoData.length} videos
            </Typography>
          </Box>
          <Chip
            label="Playlist"
            size="small"
            sx={{
              backgroundColor: "rgba(255,0,0,0.12)",
              color: "#ff0000",
              fontSize: "11px",
              fontWeight: 700,
              border: "1px solid rgba(255,0,0,0.25)",
            }}
          />
        </Box>

        {/* List of videos */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {videoData.map((video, index) => {
            const isCurrent = video.id === selectedVideo.id;
            return (
              <Box
                key={video.id}
                onClick={() => navigate(`/video/${video.id}`)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  /* Fixed row height — list NEVER shifts */
                  height: PLAYLIST_ROW_HEIGHT,
                  flexShrink: 0,
                  cursor: "pointer",
                  backgroundColor: isCurrent ? activeRowBg : "transparent",
                  borderLeft: isCurrent
                    ? "3px solid #ff0000"
                    : "3px solid transparent",
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: isCurrent ? activeRowBg : cardHoverBg,
                  },
                }}
              >
                {/* Fixed-size thumbnail */}
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 120,
                    height: 68,
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#000",
                    position: "relative",
                  }}
                >
                  <Box
                    component="img"
                    src={video.thumbnail}
                    alt={video.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {isCurrent && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(255,0,0,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PlayCircleOutlineIcon sx={{ color: "#fff", fontSize: 24 }} />
                    </Box>
                  )}
                </Box>

                {/* Text */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: isCurrent ? 700 : 500,
                      fontSize: "13px",
                      color: isCurrent ? "#ff0000" : textColor,
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 0.4,
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: metaColor,
                      fontSize: "12px",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {video.subTitle}
                  </Typography>
                  <Typography
                    sx={{
                      color: isDark
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.25)",
                      fontSize: "11px",
                      mt: 0.3,
                    }}
                  >
                    #{index + 1}
                  </Typography>
                </Box>

                <MoreVertIcon
                  sx={{ color: metaColor, fontSize: 18, flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPage;
