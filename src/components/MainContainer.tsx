import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { listVideos, type VideoInput } from "../api/libraryApi";
import VideoLibraryGrid from "./VideoLibraryGrid";
export default function MainContent({
  isSidebarExpanded,
}: {
  isSidebarExpanded: boolean;
}) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoInput[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listVideos("parent")
      .then((v) => {
        if (active) setVideos(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  return (
    <Box
      component="main"
      sx={{
        ml: { xs: 0, md: isSidebarExpanded ? "242px" : "104px" },
        mt: "88px",
        p: { xs: 2, md: 3 },
        pb: 10,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 800 }}
          >
            My Videos
          </Typography>
          <Typography color="text.secondary">
            Your personal library. Kids have their own separate list.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate("/parent")}>
          Add videos
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert
          severity="error"
          action={<Button onClick={() => setRetry((n) => n + 1)}>Retry</Button>}
        >
          {error}
        </Alert>
      ) : videos.length ? (
        <VideoLibraryGrid videos={videos} />
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h5">Your library is empty</Typography>
          <Typography color="text.secondary" sx={{ my: 2 }}>
            Search in Parent Mode and add videos to My Videos.
          </Typography>
          <Button onClick={() => navigate("/parent")} variant="outlined">
            Find videos
          </Button>
        </Box>
      )}
    </Box>
  );
}
