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
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MovieIcon from "@mui/icons-material/Movie";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

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

  const params = new URLSearchParams(location.search);
  const driveUrl = params.get("url") || "";

  const [currentVideo, setCurrentVideo] = useState<CurrentVideo>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const sidebarWidth = isMobile ? 0 : isSidebarExpanded ? 232 : 72;
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

  if (!driveUrl) {
    return (
      <Box
        sx={{
          marginLeft: isFullscreen ? 0 : `${sidebarWidth}px`,
          marginTop: "64px",
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
        marginLeft: isFullscreen ? 0 : `${sidebarWidth}px`,
        marginTop: isFullscreen ? 0 : "64px",
        minHeight: isFullscreen ? "100vh" : "calc(100vh - 64px)",
        backgroundColor: isFullscreen ? "#000" : bg,
        transition: "margin-left 0.25s ease, background-color 0.3s ease",
        position: isFullscreen ? "fixed" : "relative",
        inset: isFullscreen ? 0 : "auto",
        zIndex: isFullscreen ? 1500 : "auto",
      }}
    >
      <Box
        sx={{
          maxWidth: isFullscreen ? "100%" : 1100,
          margin: "0 auto",
          px: isFullscreen ? 0 : { xs: 2, sm: 3, md: 4 },
          py: isFullscreen ? 0 : 3,
          height: isFullscreen ? "100%" : "auto",
          display: "flex",
          flexDirection: "column",
          gap: isFullscreen ? 0 : 3,
        }}
      >
        {/* Back button */}
        {!isFullscreen && (
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              color: metaColor,
              textTransform: "none",
              fontSize: "13px",
              alignSelf: "flex-start",
              borderRadius: "20px",
              px: 1.5,
              "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" },
            }}
          >
            Back
          </Button>
        )}

        {/* Player  */}
        <Box
          sx={{
            position: "relative",
            paddingTop: isFullscreen ? "100vh" : "56.25%",
            borderRadius: isFullscreen ? 0 : "16px",
            overflow: "hidden",
            backgroundColor: "#000",
            boxShadow: isFullscreen
              ? "none"
              : isDark
                ? "0 2px 30px rgba(0,0,0,0.8)"
                : "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {/* Fullscreen toggle */}
          <IconButton
            onClick={() => setIsFullscreen(!isFullscreen)}
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
            {isFullscreen ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
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

        {/* Info section  */}
        {!isFullscreen && (
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
                {/* Series / episode label */}
                {currentVideo.type === "episode" && (
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <LiveTvIcon sx={{ color: "#ff0000", fontSize: 18 }} />
                    <Typography sx={{ color: "#ff0000", fontSize: "13px", fontWeight: 600 }}>
                      {currentVideo.seriesTitle} — Episode {currentVideo.episode_number}
                    </Typography>
                  </Box>
                )}
                {currentVideo.type === "movie" && (
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <MovieIcon sx={{ color: "#ff0000", fontSize: 18 }} />
                    <Typography sx={{ color: "#ff0000", fontSize: "13px", fontWeight: 600 }}>
                      Movie
                    </Typography>
                  </Box>
                )}

                {/* Title */}
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

                {/* Metadata chips */}
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
                        backgroundColor: "rgba(255,0,0,0.12)",
                        color: "#ff0000",
                        fontSize: "11px",
                        fontWeight: 600,
                        height: 22,
                        border: "1px solid rgba(255,0,0,0.2)",
                      }}
                    />
                  ))}
                </Box>

                <Divider sx={{ borderColor, mb: 2 }} />

                {/* Description */}
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
    </Box>
  );
};
