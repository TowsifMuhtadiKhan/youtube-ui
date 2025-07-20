import React from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  Skeleton,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import driveData from "./driveData.json";

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
  id: string;
  type: "episode";
  episode_number: number;
  seriesTitle: string;
}

type CurrentVideo = Movie | Episode | null;

export const DrivePlayer: React.FC<DrivePlayerProps> = ({
  isSidebarExpanded,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const driveUrl = params.get("url") || "";

  const [currentVideo, setCurrentVideo] = React.useState<CurrentVideo>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const findCurrentVideo = (): CurrentVideo => {
      // Check movies
      for (const movie of driveData.movies) {
        if (movie.drive_url === driveUrl) {
          return {
            ...movie,
            type: "movie" as const,
          };
        }
      }

      // Check series episodes
      for (const series of driveData.series) {
        for (const episode of series.episodes) {
          if (episode.drive_url === driveUrl) {
            return {
              id: `${series.id}_ep${episode.episode_number}`, // Add fallback ID if needed
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

    setLoading(true);
    const video = findCurrentVideo();
    setCurrentVideo(video);
    setLoading(false);
  }, [driveUrl]);

  if (!driveUrl) {
    return (
      <Box
        sx={{
          marginLeft: isSidebarExpanded ? "240px" : "64px",
          padding: 3,
          backgroundColor: "#000",
          minHeight: "100vh",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">No video URL provided</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        marginLeft: isSidebarExpanded ? "240px" : "64px",
        padding: 3,
        backgroundColor: "#000",
        minHeight: "100vh",
        marginTop: isMobile ? "56px" : "64px",
        color: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: isMobile ? "100%" : "1200px",
          margin: "0 auto",
        }}
      >
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={40} />
        ) : null}

        <Box
          sx={{
            position: "relative",
            paddingTop: "56.25%", // 16:9 aspect ratio
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#111",
          }}
        >
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
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="100%" height={80} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        ) : currentVideo ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {currentVideo.type === "episode" && (
              <Typography variant="h6">
                {currentVideo.seriesTitle} • Episode{" "}
                {currentVideo.episode_number}
              </Typography>
            )}
            <Typography fontSize={"20px"} fontWeight={700}>
              {currentVideo?.title || "Video Player"}
            </Typography>

            <Typography variant="body1">{currentVideo.description}</Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {currentVideo.type === "movie" && currentVideo.genre && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {currentVideo.genre.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: "white",
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Typography variant="body1">
            Video information not available
          </Typography>
        )}
      </Box>
    </Box>
  );
};
