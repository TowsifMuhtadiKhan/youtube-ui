import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  Skeleton,
  IconButton,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import driveData from "./driveData.json";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

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

  const [currentVideo, setCurrentVideo] = useState<CurrentVideo>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
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

    setLoading(true);
    const video = findCurrentVideo();
    setCurrentVideo(video);
    setLoading(false);
  }, [driveUrl]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!driveUrl) {
    return (
      <Box
        sx={{
          marginLeft: isFullscreen ? 0 : isSidebarExpanded ? "240px" : "64px",
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

  const playerContainerRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handlePlayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerContainerRef.current || !iframeRef.current) return;

    // Get the position and dimensions of the player container
    const rect = playerContainerRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const containerWidth = rect.width;

    // Determine if click was on left or right half
    const isLeftClick = clickPosition < containerWidth / 2;

    try {
      // Access the iframe's contentWindow to send messages
      const iframeWindow = iframeRef.current.contentWindow;

      if (iframeWindow) {
        // Send a message to the iframe to seek forward or backward
        // Note: This assumes the iframe content is set up to handle these messages
        iframeWindow.postMessage(
          {
            type: "seek",
            seconds: isLeftClick ? -10 : 10,
          },
          "*"
        );
      }
    } catch (error) {
      console.error("Error communicating with iframe:", error);
    }
  };

  return (
    <Box
      sx={{
        marginLeft: isFullscreen ? 0 : isSidebarExpanded ? "240px" : "64px",
        padding: isFullscreen ? 0 : 3,
        backgroundColor: "#000",
        minHeight: "100vh",
        marginTop: isFullscreen ? 0 : isMobile ? "56px" : "64px",
        color: "white",
        position: isFullscreen ? "fixed" : "relative",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: isFullscreen ? 1500 : "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: isFullscreen ? "100%" : isMobile ? "100%" : "1200px",
          margin: "0 auto",
          height: isFullscreen ? "100%" : "auto",
        }}
      >
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={40} />
        ) : null}

        <Box
          sx={{
            position: "relative",
            paddingTop: isFullscreen ? "100vh" : "56.25%", // Full height in fullscreen mode
            borderRadius: isFullscreen ? 0 : "8px",
            overflow: "hidden",
            backgroundColor: "#111",
          }}
        >
          {isMobile && (
            <IconButton
              onClick={toggleFullscreen}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 100,
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "white",
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          )}
          <Box ref={playerContainerRef} onClick={handlePlayerClick}>
            <iframe
              ref={iframeRef}
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
        </Box>

        {!isFullscreen && (
          <>
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

                <Typography variant="body1">
                  {currentVideo.description}
                </Typography>

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
          </>
        )}
      </Box>
    </Box>
  );
};
