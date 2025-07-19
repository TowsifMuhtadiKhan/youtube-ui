import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import videoData from "./data.json";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { Switch, FormControlLabel } from "@mui/material";

interface VideoPageProps {
  isSidebarExpanded: boolean;
}

const VideoPage: React.FC<VideoPageProps> = ({ isSidebarExpanded }) => {
  const { id } = useParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  const videoEmbedUrl = `https://www.youtube.com/embed/${id}?rel=0&autoplay=1&enablejsapi=1`;

  const selectedVideo = videoData.find((video) => video.id === id);

  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

  if (!selectedVideo) {
    return <Box sx={{ color: "white", padding: 4 }}>Video not found</Box>;
  }
  const videoIndex = videoData.findIndex((video) => video.id === id);

  const handlePrevious = () => {
    if (videoIndex > 0) {
      navigate(`/video/${videoData[videoIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (videoIndex < videoData.length - 1) {
      navigate(`/video/${videoData[videoIndex + 1].id}`);
    }
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  useEffect(() => {
    if (!autoPlayEnabled) return;
    const onPlayerReady = (event: any) => {
      event.target.playVideo();
    };

    const onPlayerStateChange = (event: any) => {
      if (event.data === 0) {
        handleNext();
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      new (window as any).YT.Player(iframeRef.current, {
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      new (window as any).YT.Player(iframeRef.current, {
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }

    return () => {
      if ((window as any).onYouTubeIframeAPIReady) {
        delete (window as any).onYouTubeIframeAPIReady;
      }
    };
  }, [id, handleNext]);

  return (
    <Box
      sx={{
        marginLeft: isSidebarExpanded ? "240px" : "64px",
        overflow: "auto",
        height: "100%",
        padding: 2,
        paddingTop: 9,
        backgroundColor: "#000",
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8, lg: 8 }}>
          <Box
            sx={{
              borderRadius: 2,
              paddingBottom: 4,
              backgroundColor: "#111",

              position: "relative",
            }}
          >
            <iframe
              ref={iframeRef}
              width="100%"
              height="600"
              src={videoEmbedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end", // This will push content to the right
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={autoPlayEnabled}
                    onChange={() => setAutoPlayEnabled(!autoPlayEnabled)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#ff0000", // Red color when checked
                        "&:hover": {
                          backgroundColor: "rgba(255, 0, 0, 0.08)",
                        },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#ff0000", // Red track when checked
                        },
                    }}
                  />
                }
                label="Autoplay"
                labelPlacement="start"
                sx={{
                  color: "#fff",
                  marginLeft: 1,
                  marginRight: 1,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                  },
                }}
              />
            </Box>
            <Typography
              sx={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "24px",
                marginTop: 2,
              }}
              px={2}
            >
              {selectedVideo.title}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 2,
              }}
              px={2}
            >
              {/* Previous Button */}
              <Button
                variant="outlined"
                sx={{
                  backgroundColor: "#333",
                  color: "#fff",
                  borderColor: "#555",
                  "&:hover": {
                    backgroundColor: "#444",
                  },
                }}
                disabled={videoIndex === 0}
                onClick={handlePrevious}
                startIcon={<SkipPreviousIcon />}
              >
                Previous
              </Button>

              {/* Next Button */}
              <Button
                variant="outlined"
                sx={{
                  backgroundColor: "#333",
                  color: "#fff",
                  borderColor: "#555",
                  "&:hover": {
                    backgroundColor: "#444",
                  },
                }}
                disabled={videoIndex === videoData.length - 1}
                onClick={handleNext}
                endIcon={<SkipNextIcon />}
              >
                Next
              </Button>
            </Box>
            <Box
              sx={{
                position: "absolute",
                top: "40%",
                transform: "translateY(-50%)",
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                opacity: 0, // Initially hidden
                transition: "opacity 0.3s ease-in-out",
                "&:hover": {
                  opacity: 1, // Show buttons on hover
                },
              }}
            >
              {/* Previous Button */}
              <IconButton
                sx={{
                  backgroundColor: "#333",
                  color: "#fff",
                  borderColor: "#555",
                  "&:hover": {
                    backgroundColor: "#444",
                  },
                }}
                disabled={videoIndex === 0}
                onClick={handlePrevious}
              >
                <SkipPreviousIcon />
              </IconButton>

              {/* Next Button */}
              <IconButton
                sx={{
                  backgroundColor: "#333",
                  color: "#fff",
                  borderColor: "#555",
                  "&:hover": {
                    backgroundColor: "#444",
                  },
                }}
                disabled={videoIndex === videoData.length - 1}
                onClick={handleNext}
              >
                <SkipNextIcon />
              </IconButton>
            </Box>
          </Box>
          {/* Display the title of the current video under the iframe */}
        </Grid>
        <Grid size={{ xs: 12, md: 4, lg: 4 }}>
          <Box
            sx={{
              overflowY: "auto",
            }}
            py={2}
            px={2.5}
            border={"2px solid #333"}
            borderRadius={2}
          >
            <Grid container spacing={2}>
              {videoData.map((video) => (
                <Grid size={{ xs: 12 }} key={video.id}>
                  <Box
                    sx={{
                      borderLeft:
                        video.id === selectedVideo.id
                          ? "2px solid red"
                          : "none",
                    }}
                    pl={1}
                  >
                    <Box
                      sx={{
                        borderRadius: 2,
                        maxWidth: 550,
                        minHeight: 100,
                      }}
                      display={"flex"}
                      flexDirection={"row"}
                      gap={1}
                    >
                      <Box
                        style={{
                          height: 100,
                          minWidth: 150,
                          backgroundImage: `url(${video.thumbnail})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "20px",
                          cursor: "pointer",
                          transition: "transform 0.3s ease-in-out",
                          marginRight: 10,
                        }}
                        onClick={() => handleVideoClick(video.id)}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.transform = "scale(1.02)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      />
                      <Box sx={{ paddingTop: 1, paddingBottom: 1 }}>
                        <Box
                          display={"flex"}
                          justifyContent={"space-between"}
                          gap={1}
                        >
                          <Box>
                            <Typography
                              sx={{ fontWeight: "bold", fontSize: 16 }}
                            >
                              <a
                                href={video.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "inherit",
                                  textDecoration: "none",
                                  display: "block",
                                  lineHeight: 1.5,
                                }}
                              >
                                {video.title}
                              </a>
                            </Typography>
                            <Typography
                              sx={{
                                color: "#888",
                                fontSize: 14,
                                marginTop: 1,
                              }}
                            >
                              {video.subTitle}
                            </Typography>
                          </Box>
                          <MoreVertIcon sx={{ color: "#888", fontSize: 24 }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VideoPage;
