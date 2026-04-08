import React from "react";
import {
  Box,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MovieIcon from "@mui/icons-material/Movie";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import driveData from "./driveData.json";
import { useThemeMode } from "./ThemeContext";

interface MediaBrowserProps {
  isSidebarExpanded: boolean;
}

const MOVIE_THUMB_HEIGHT = 260;
const EPISODE_THUMB_HEIGHT = 160;

const MediaBrowser: React.FC<MediaBrowserProps> = ({ isSidebarExpanded }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { primaryColor } = useThemeMode();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const sidebarWidthVal = isSidebarExpanded ? 242 : 104;
  const totalMarginLeft = isMobile ? 0 : sidebarWidthVal;
  const cardBg = isDark ? "#1a1a1a" : "#f5f5f5";
  const textColor = isDark ? "#f1f1f1" : "#0f0f0f";
  const metaColor = isDark ? "#aaaaaa" : "#606060";

  const handlePlay = (driveUrl: string) => {
    navigate(`/movies/player?url=${encodeURIComponent(driveUrl)}`);
  };

  const renderMediaCard = (media: any, isEpisode = false) => {
    const thumbHeight = isEpisode ? EPISODE_THUMB_HEIGHT : MOVIE_THUMB_HEIGHT;
    const infoHeight = isEpisode ? 100 : 110;

    return (
      <Card
        sx={{
          backgroundColor: cardBg,
          border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.07)",
          borderRadius: "14px",
          boxShadow: "none",
          overflow: "hidden",
          height: thumbHeight + infoHeight,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.25s ease",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: isDark ? "0 16px 48px rgba(0,0,0,0.7)" : "0 8px 32px rgba(0,0,0,0.15)",
            "& .play-btn": { opacity: 1, transform: "translate(-50%,-50%) scale(1)" },
            "& .card-thumb": { transform: "scale(1.05)" },
          },
        }}
        onClick={() => handlePlay(media.drive_url)}
      >
        <Box sx={{ position: "relative", height: thumbHeight, flexShrink: 0, overflow: "hidden" }}>
          <Box
            className="card-thumb"
            component="img"
            src={media.thumbnail}
            alt={media.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
          />
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
          <IconButton
            className="play-btn"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(0.85)",
              opacity: 0,
              transition: "all 0.25s ease",
              backgroundColor: primaryColor,
              boxShadow: `0 4px 24px ${primaryColor}66`,
              width: 50,
              height: 50,
              "&:hover": { backgroundColor: primaryColor, filter: "brightness(0.9)" },
            }}
            onClick={(e) => { e.stopPropagation(); handlePlay(media.drive_url); }}
          >
            <PlayArrowIcon sx={{ fontSize: 28, color: "#fff" }} />
          </IconButton>
        </Box>

        <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 }, height: infoHeight, display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "13px", color: textColor, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {media.title}
          </Typography>

          <Box>
            {isEpisode && (
              <Chip
                label={`Ep ${media.episode_number} • ${media.duration}`}
                size="small"
                sx={{ mb: 0.75, backgroundColor: `${primaryColor}22`, color: primaryColor, fontSize: "10px", fontWeight: 600, height: 20, border: `1px solid ${primaryColor}44` }}
              />
            )}
            <Typography sx={{ color: metaColor, fontSize: "11px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: isEpisode ? 1 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {media.description}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ marginLeft: `${totalMarginLeft}px`, marginTop: "88px", minHeight: "calc(100vh - 88px)", backgroundColor: isDark ? "#0f0f0f" : "#ffffff", transition: "margin-left 0.25s ease, background-color 0.3s ease", px: { xs: 2, sm: 3, md: 4 }, pt: 5, pb: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <MovieIcon sx={{ color: primaryColor, fontSize: 26 }} />
        <Typography sx={{ fontSize: { xs: "20px", md: "24px" }, fontWeight: 800, color: textColor, letterSpacing: "-0.5px" }}>Movies</Typography>
        <Chip label={`${driveData.movies.length} titles`} size="small" sx={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", color: metaColor, fontSize: "11px" }} />
      </Box>

      <Grid container spacing={2.5} alignItems="stretch">
        {driveData.movies.map((movie) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={movie.id}>
            {renderMediaCard(movie)}
          </Grid>
        ))}
      </Grid>

      {driveData.series.map((series) => (
        <Box key={series.id} sx={{ mt: 6 }}>
          <Divider sx={{ mb: 3, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)" }} />
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <LiveTvIcon sx={{ color: primaryColor, fontSize: 24 }} />
            <Typography sx={{ fontSize: { xs: "18px", md: "22px" }, fontWeight: 800, color: textColor, letterSpacing: "-0.4px" }}>{series.title}</Typography>
          </Box>
          <Typography sx={{ color: metaColor, fontSize: "13px", mb: 2.5, maxWidth: 600, lineHeight: 1.6 }}>{series.description}</Typography>
          <Grid container spacing={2.5} alignItems="stretch">
            {series.episodes.map((episode) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={episode.drive_url}>
                {renderMediaCard(episode, true)}
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default MediaBrowser;
