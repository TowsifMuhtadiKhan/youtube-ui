import React from "react";
import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import videoData from "./data.json";

interface MainContentProps {
  isSidebarExpanded: boolean;
}

const CARD_THUMB_HEIGHT = 230; // increased thumbnail height

const MainContent: React.FC<MainContentProps> = ({ isSidebarExpanded }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const sidebarWidth = isMobile ? 0 : isSidebarExpanded ? 232 : 72;
  const cardBg = isDark ? "#1a1a1a" : "#f5f5f5";
  const cardHoverBg = isDark ? "#242424" : "#eaeaea";
  const metaColor = isDark ? "#aaaaaa" : "#606060";
  const titleColor = isDark ? "#f1f1f1" : "#0f0f0f";

  return (
    <Box
      sx={{
        marginLeft: `${sidebarWidth}px`,
        marginTop: "64px",
        minHeight: "calc(100vh - 64px)",
        backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
        transition: "margin-left 0.25s ease, background-color 0.3s ease",
        px: { xs: 2, sm: 3, md: 4 },
        pt: 5, /* Increased top padding over the media */
        pb: 4,
      }}
    >
      {/* Heading */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          sx={{
            fontSize: { xs: "18px", md: "22px" },
            fontWeight: 800,
            color: titleColor,
            letterSpacing: "-0.4px",
          }}
        >
          Recommended
        </Typography>
        <Chip
          label={`${videoData.length} videos`}
          size="small"
          sx={{
            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            color: metaColor,
            fontSize: "12px",
            fontWeight: 600,
            height: 24,
          }}
        />
      </Box>

      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {videoData.map((video) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={video.id}>
            {/* Fixed-height card */}
            <Box
              className="fade-in"
              sx={{
                borderRadius: "14px",
                overflow: "hidden",
                backgroundColor: cardBg,
                cursor: "pointer",
                border: isDark
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "1px solid rgba(0,0,0,0.06)",
                /* ---- fixed card height ---- */
                height: isMobile ? 300 : 345,
                display: "flex",
                flexDirection: "column",
                /* ---- end fixed ---- */
                transition: "all 0.25s ease",
                "&:hover": {
                  backgroundColor: cardHoverBg,
                  transform: "translateY(-3px)",
                  boxShadow: isDark
                    ? "0 12px 40px rgba(0,0,0,0.7)"
                    : "0 8px 30px rgba(0,0,0,0.15)",
                  "& .thumb-overlay": { opacity: 1 },
                  "& .thumb-img": { transform: "scale(1.04)" },
                },
              }}
              onClick={() => navigate(`/video/${video.id}`)}
            >
              {/* Thumbnail — fixed height */}
              <Box
                sx={{
                  position: "relative",
                  height: isMobile ? 175 : CARD_THUMB_HEIGHT,
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <Box
                  className="thumb-img"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${video.thumbnail})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transition: "transform 0.4s ease",
                  }}
                />
                {/* Play overlay */}
                <Box
                  className="thumb-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.35)",
                    opacity: 0,
                    transition: "opacity 0.25s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 0, 0, 0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 20px rgba(255,0,0,0.4)",
                    }}
                  >
                    <SlowMotionVideoIcon sx={{ color: "#fff", fontSize: 24 }} />
                  </Box>
                </Box>
              </Box>

              {/* Info — fills remainder of card */}
              <Box
                sx={{
                  p: 1.75,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: isMobile ? "13px" : "14px",
                        color: titleColor,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 0.5,
                      }}
                    >
                      <a
                        href={video.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "inherit", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {video.title}
                      </a>
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
                  </Box>
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      cursor: "pointer",
                      borderRadius: "50%",
                      p: 0.25,
                      flexShrink: 0,
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <MoreVertIcon sx={{ color: metaColor, fontSize: 18 }} />
                  </Box>
                </Box>

                {/* Bottom meta row */}
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: metaColor }} />
                  <Typography sx={{ color: metaColor, fontSize: "11px" }}>
                    Watch now
                  </Typography>
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
