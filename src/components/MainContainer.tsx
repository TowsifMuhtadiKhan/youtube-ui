import React from "react";
import { Box, Typography, Grid, useMediaQuery, useTheme } from "@mui/material";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import videoData from "./data.json";

// Sample data imported from JSON or passed as a prop

interface MainContentProps {
  isSidebarExpanded: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarExpanded }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <Box
      sx={{
        marginLeft: isSidebarExpanded ? 30 : 10,
        marginTop: 10,
        overflowY: "auto",
      }}
      px={4}
      py={2}
    >
      <Grid container spacing={2}>
        {videoData.map((video) => (
          <Grid size={{ xs: 12, md: 4, lg: 4 }} key={video.id}>
            <Box
              sx={{
                borderRadius: 2,
                maxWidth: 550,
                minHeight: 350,
              }}
            >
              <Box
                style={{
                  height: isMobile ? 200 : 300,
                  backgroundImage: `url(${video.thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "transform 0.3s ease-in-out",
                }}
                onClick={() => handleVideoClick(video.id)}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
              <Box sx={{ paddingTop: 2, paddingBottom: 2 }}>
                <Box display={"flex"} justifyContent={"space-between"} gap={1}>
                  {" "}
                  <SlowMotionVideoIcon
                    sx={{ color: "#888", fontSize: isMobile ? 30 : 46 }}
                  />
                  <Box>
                    {" "}
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        fontSize: isMobile ? 14 : 16,
                      }}
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainContent;
