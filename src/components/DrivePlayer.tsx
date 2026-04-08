import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  Skeleton,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import driveData from "./driveData.json";
import ScreenRotationIcon from "@mui/icons-material/ScreenRotation";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MovieIcon from "@mui/icons-material/Movie";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useThemeMode } from "./ThemeContext";

interface DrivePlayerProps {
  isSidebarExpanded: boolean;
}

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  duration: string;
  drive_url: string;
  thumbnail?: string;
  upload_date?: string;
}

interface Movie extends VideoDetails {
  type: "movie";
  genre?: string[];
}

interface Episode extends VideoDetails {
  type: "episode";
  episode_number: number;
  seriesTitle: string;
}

type CurrentVideo = Movie | Episode | null;

export const DrivePlayer: React.FC<DrivePlayerProps> = ({ isSidebarExpanded }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const { primaryColor } = useThemeMode();

  const params = new URLSearchParams(location.search);
  const driveUrl = params.get("url") || "";

  const [currentVideo, setCurrentVideo] = useState<CurrentVideo>(null);
  const [loading, setLoading] = useState(true);
  const [isRotated, setIsRotated] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const sidebarWidthVal = isSidebarExpanded ? 242 : 104;
  const totalMarginLeft = isMobile ? 0 : sidebarWidthVal;
  const bg = isDark ? "#0f0f0f" : "#ffffff";
  const cardBg = isDark ? "#1a1a1a" : "#f5f5f5";
  const textColor = isDark ? "#f1f1f1" : "#0f0f0f";
  const metaColor = isDark ? "#aaaaaa" : "#606060";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    setLoading(true);
    const findVideo = (): CurrentVideo => {
      for (const movie of driveData.movies) {
        if (movie.drive_url === driveUrl)
          return { ...movie, type: "movie" as const };
      }
      for (const series of driveData.series) {
        for (const episode of series.episodes) {
          if (episode.drive_url === driveUrl) {
            return {
              id: `${series.id}_ep${episode.episode_number}`,
              title: episode.title,
              description: episode.description,
              duration: episode.duration,
              drive_url: episode.drive_url,
              thumbnail: episode.thumbnail,
              upload_date: episode.upload_date,
              type: "episode" as const,
              episode_number: episode.episode_number,
              seriesTitle: series.title,
            };
          }
        }
      }
      return null;
    };
    setCurrentVideo(findVideo());
    setLoading(false);
  }, [driveUrl]);

  const toggleRotate = async () => {
    if (!isRotated) {
      if (isMobile) {
        try { await ScreenOrientation.lock({ orientation: "landscape" }); } catch { /* ignore */ }
      }
      setIsRotated(true);
    } else {
      if (isMobile) {
        try { await ScreenOrientation.unlock(); } catch { /* ignore */ }
      }
      setIsRotated(false);
    }
  };

  if (!driveUrl) {
    return (
      <Box
        sx={{
          marginLeft: `${totalMarginLeft}px`,
          marginTop: "88px",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <MovieIcon sx={{ fontSize: 72, color: "#444" }} />
        <Typography sx={{ color: metaColor, fontSize: "18px", fontWeight: 600 }}>
          No video URL provided
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/movies")}
          sx={{ borderRadius: "20px", textTransform: "none", borderColor, color: textColor }}
        >
          Back to Movies
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        marginLeft: isRotated ? 0 : `${totalMarginLeft}px`,
        marginTop: isRotated ? 0 : "88px",
        minHeight: isRotated ? "100vh" : "calc(100vh - 88px)",
        backgroundColor: "transparent",
        transition: "all 0.4s ease",
        position: isRotated ? "fixed" : "relative",
        inset: isRotated ? 0 : "auto",
        zIndex: isRotated ? 1500 : "auto",
        display: "flex",
        flexDirection: isMobile || isRotated ? "column" : "row",
        alignItems: "flex-start",
        paddingLeft: isRotated ? 0 : { xs: 0, md: "24px" },
        paddingRight: isRotated ? 0 : { xs: 0, md: "24px" },
        gap: isRotated ? 0 : 4,
      }}
    >
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          backgroundColor: isDark ? "#080808" : bg,
          backgroundImage: isDark && !isRotated 
            ? `radial-gradient(circle at 30% 30%, ${primaryColor}15, transparent 70%)` 
            : "none",
        }}
      />

      <Box
        sx={{
          flex: isRotated || isMobile ? "none" : "1 1 0",
          minWidth: 0,
          width: "100%",
          maxWidth: isRotated || isMobile ? "100%" : `calc(100vw - 380px - ${totalMarginLeft + 96}px)`,
          pt: isRotated ? 0 : { xs: 2, md: 1 },
          pb: isRotated ? 0 : 6,
          display: "flex",
          flexDirection: "column",
          gap: isRotated ? 0 : 3,
        }}
      >

        <Box
          sx={{
            borderRadius: isRotated ? 0 : "24px",
            overflow: "hidden",
            backgroundColor: "#000",
            border: isRotated ? "none" : `1px solid ${primaryColor}33`,
            boxShadow: isRotated
              ? "none"
              : isDark
                ? `0 30px 100px -20px ${primaryColor}25, 0 15px 50px rgba(0,0,0,0.9)`
                : "0 10px 40px rgba(0,0,0,0.1)",
                
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
            } : {
              position: "relative",
              paddingTop: "56.25%",
            }),
          }}
        >
          <IconButton
            onClick={toggleRotate}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 100,
              backgroundColor: "rgba(0,0,0,0.55)",
              color: "#fff",
              width: 36,
              height: 36,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
            }}
          >
            <ScreenRotationIcon fontSize="small" />
          </IconButton>

          {loading ? (
            <Skeleton
              variant="rectangular"
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: isDark ? "#1a1a1a" : "#eee",
              }}
            />
          ) : (
            <iframe
              src={driveUrl}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="autoplay; fullscreen"
              allowFullScreen
              title="Video Player"
            />
          )}
        </Box>

        {!isRotated && (
          <Box
            sx={{
              backgroundColor: cardBg,
              borderRadius: "16px",
              p: { xs: 2, md: 3 },
              border: `1px solid ${borderColor}`,
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ backgroundColor: isDark ? "#2a2a2a" : "#ddd" }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ backgroundColor: isDark ? "#2a2a2a" : "#ddd" }} />
                <Skeleton variant="text" width="40%" height={20} sx={{ backgroundColor: isDark ? "#2a2a2a" : "#ddd" }} />
              </Box>
            ) : currentVideo ? (
              <>
                {currentVideo.type === "episode" && (
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <LiveTvIcon sx={{ color: primaryColor, fontSize: 18 }} />
                    <Typography sx={{ color: primaryColor, fontSize: "13px", fontWeight: 600 }}>
                      {currentVideo.seriesTitle} — Episode {currentVideo.episode_number}
                    </Typography>
                  </Box>
                )}
                {currentVideo.type === "movie" && (
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <MovieIcon sx={{ color: primaryColor, fontSize: 18 }} />
                    <Typography sx={{ color: primaryColor, fontSize: "13px", fontWeight: 600 }}>
                      Movie
                    </Typography>
                  </Box>
                )}

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "18px", md: "24px" },
                    color: textColor,
                    letterSpacing: "-0.4px",
                    lineHeight: 1.3,
                    mb: 2,
                  }}
                >
                  {currentVideo.title}
                </Typography>

                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mb={2}>
                  {currentVideo.duration && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: metaColor }} />
                      <Typography sx={{ color: metaColor, fontSize: "12px" }}>
                        {currentVideo.duration}
                      </Typography>
                    </Box>
                  )}
                  {currentVideo.upload_date && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CalendarTodayIcon sx={{ fontSize: 13, color: metaColor }} />
                      <Typography sx={{ color: metaColor, fontSize: "12px" }}>
                        {currentVideo.upload_date}
                      </Typography>
                    </Box>
                  )}
                  {currentVideo.type === "movie" && currentVideo.genre?.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      size="small"
                      sx={{
                        backgroundColor: `${primaryColor}22`,
                        color: primaryColor,
                        fontSize: "11px",
                        fontWeight: 600,
                        height: 22,
                        border: `1px solid ${primaryColor}33`,
                      }}
                    />
                  ))}
                </Box>

                <Divider sx={{ borderColor, mb: 2 }} />

                <Typography
                  sx={{
                    color: metaColor,
                    fontSize: "14px",
                    lineHeight: 1.75,
                  }}
                >
                  {currentVideo.description}
                </Typography>
              </>
            ) : (
              <Typography sx={{ color: metaColor, fontSize: "14px" }}>
                Video information not available.
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* ── RIGHT COLUMN: UP NEXT ── */}
      {!isRotated && !isMobile && currentVideo && (
        <Box sx={{ flex: "0 0 380px", display: "flex", flexDirection: "column", pt: 1, pb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", mb: 2, color: textColor }}>
            More to Watch
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {driveData.movies
              .filter(m => m.drive_url !== currentVideo?.drive_url)
              .slice(0, 10)
              .map(movie => (
                <Box 
                    key={movie.id} 
                    onClick={() => navigate(`/movies/player?url=${encodeURIComponent(movie.drive_url)}`)}
                    sx={{ 
                      display: "flex", gap: 1.5, cursor: "pointer", 
                      "&:hover .thumb": { transform: "scale(1.05)" },
                      "&:hover .title": { color: primaryColor }
                    }}
                >
                    <Box sx={{ width: 140, height: 80, borderRadius: "10px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                        <Box className="thumb" sx={{ transition: "transform 0.3s ease", position: "absolute", inset: 0, backgroundImage: `url(${movie.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography className="title" sx={{ transition: "color 0.2s", color: textColor, fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2, mb: 0.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {movie.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Chip label="MOVIE" size="small" sx={{ height: 16, fontSize: "9px", fontWeight: 700, bgcolor: `${primaryColor}22`, color: primaryColor }} />
                          <Typography sx={{ color: metaColor, fontSize: "0.75rem" }}>{movie.duration}</Typography>
                        </Box>
                    </Box>
                </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
