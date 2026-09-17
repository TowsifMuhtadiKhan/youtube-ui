import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { decodeTitle, type VideoInput } from "../api/libraryApi";
export default function VideoLibraryGrid({
  videos,
  kids = false,
  disabled = false,
}: {
  videos: VideoInput[];
  kids?: boolean;
  disabled?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0,1fr)",
          sm: "repeat(2,minmax(0,1fr))",
          lg: "repeat(3,minmax(0,1fr))",
          xl: "repeat(4,minmax(0,1fr))",
        },
        gap: { xs: 2, md: 3 },
      }}
    >
      {videos.map((v) => (
        <Card
          key={v.youtubeVideoId}
          sx={{ borderRadius: kids ? '14px' : 3, minWidth: 0, boxShadow: "none" }}
        >
          <CardActionArea
            disabled={disabled}
            onClick={() =>
              navigate((kids ? "/kids/watch/" : "/watch/") + v.youtubeVideoId)
            }
          >
            <CardMedia
              component="img"
              image={v.thumbnail}
              alt={v.title}
              sx={{ aspectRatio: "16/9", objectFit: "cover" }}
            />
            <CardContent>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {decodeTitle(v.title)}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {decodeTitle(v.channelName)}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}
