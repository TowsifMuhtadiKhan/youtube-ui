import React from "react";
import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Card,
  CardMedia,
  CardContent,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import driveData from "./driveData.json"; // Your provided JSON data

interface MediaBrowserProps {
  isSidebarExpanded: boolean;
}

const MediaBrowser: React.FC<MediaBrowserProps> = ({ isSidebarExpanded }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handlePlay = (driveUrl: string) => {
    navigate(`/player?url=${encodeURIComponent(driveUrl)}`);
  };

  const renderMediaCard = (media: any, isEpisode = false) => (
    <Card
      sx={{
        maxWidth: isMobile ? "100%" : 340,
        m: 1,
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: theme.shadows[6],
        },
        backgroundColor: "#1A1A1A",
        color: "white",
        border: "none",
        boxShadow: "none",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height={isEpisode ? 180 : 440}
          image={media.thumbnail}
          alt={media.title}
          sx={{ borderRadius: 1 }}
        />
        <IconButton
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0,0,0,0.5)",
            "&:hover": {
              backgroundColor: "rgba(255,0,0,0.7)",
            },
          }}
          onClick={() => handlePlay(media.drive_url)}
        >
          <PlayArrowIcon sx={{ fontSize: 50, color: "white" }} />
        </IconButton>
      </Box>
      <CardContent sx={{ px: 2, py: 1 }}>
        <Typography mt={1} fontWeight={700} fontSize={"16px"}>
          {media.title}
        </Typography>
        {!isEpisode && (
          <Typography mt={1} fontSize={"14px"} color="#D6D6D6">
            {media.description}
          </Typography>
        )}
        {isEpisode && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {media.description}
            </Typography>
            <Typography variant="caption" display="block">
              Episode {media.episode_number} • {media.duration}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        marginLeft: isSidebarExpanded ? "240px" : "64px",
        p: 3,
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
      mt={10}
      bgcolor="#000"
    >
      {/* Movies Section */}
      <Typography mb={3} fontWeight={700} fontSize={"20px"}>
        Movies
      </Typography>
      <Grid container spacing={2}>
        {driveData.movies.map((movie) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={movie.id}>
            {renderMediaCard(movie)}
          </Grid>
        ))}
      </Grid>

      {/* Series Section */}
      {driveData?.series.map((series) => (
        <Box key={series.id} sx={{ mt: 6 }}>
          <Typography variant="h4" sx={{ mb: 3, color: "white" }}>
            {series.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
            {series.description}
          </Typography>
          <Grid container spacing={2}>
            {series.episodes.map((episode) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={episode.drive_url}
              >
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
