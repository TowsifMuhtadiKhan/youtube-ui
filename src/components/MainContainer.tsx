import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchApprovedVideos, type ApprovedVideo } from "../api/parentalApi";
export default function MainContent({ isSidebarExpanded }: { isSidebarExpanded: boolean }) {
 const navigate = useNavigate();
 const [videos, setVideos] = useState<ApprovedVideo[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [reload, setReload] = useState(0);
 useEffect(() => {
  let active = true;
  setLoading(true); setError("");
  fetchApprovedVideos().then(result => { if (active) setVideos(result); })
   .catch(() => { if (active) setError("Unable to load approved videos. Check the backend connection and try again."); })
   .finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
 }, [reload]);
 return <Box sx={{ ml: { xs: 0, md: isSidebarExpanded ? "242px" : "104px" }, mt: "88px", p: { xs: 2, md: 4 } }}>
  <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={3}>
   <Box><Typography variant="h4" fontWeight={800}>Your approved videos</Typography><Typography color="text.secondary">Only videos added by a parent appear here.</Typography></Box>
   <Button variant="contained" onClick={() => navigate("/parent")}>Parent Mode</Button>
  </Box>
  {loading ? <CircularProgress /> : error ? <Alert severity="error" action={<Button onClick={() => setReload(n => n + 1)}>Retry</Button>}>{error}</Alert> : videos.length === 0 ? <Box textAlign="center" py={8}>
   <Typography variant="h5" mb={1}>No videos added yet</Typography><Typography color="text.secondary" mb={3}>Open Parent Mode to add the videos you want to see.</Typography><Button variant="outlined" onClick={() => navigate("/parent")}>Add videos</Button>
  </Box> : <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
   {videos.map(video => <Card key={video.youtubeVideoId} sx={{ borderRadius: 3 }}><CardActionArea onClick={() => navigate("/kids/watch/" + video.youtubeVideoId)}>
    <CardMedia component="img" image={video.thumbnail} alt={video.title} sx={{ aspectRatio: "16/9", objectFit: "cover" }} /><CardContent><Typography fontWeight={700}>{video.title}</Typography><Typography variant="body2" color="text.secondary">{video.channelName}</Typography></CardContent>
   </CardActionArea></Card>)}
  </Box>}
 </Box>;
}
