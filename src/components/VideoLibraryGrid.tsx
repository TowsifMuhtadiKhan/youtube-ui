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

const RAINBOW = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#9B5DE5', '#F15BB5'];

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
      {videos.map((v, index) => (
        <Card
          key={v.youtubeVideoId}
          sx={{
            borderRadius: kids ? '20px' : 3,
            minWidth: 0,
            boxShadow: kids ? undefined : 'none',
            ...(kids && {
              borderLeft: `4px solid ${RAINBOW[index % RAINBOW.length]}`,
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': {
                transform: 'translateY(-6px) scale(1.02) rotate(0.5deg)',
              },
            }),
          }}
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
              sx={{
                aspectRatio: "16/9",
                objectFit: "cover",
                ...(kids && {
                  transition: 'transform 0.4s ease',
                  '&:hover': { transform: 'scale(1.05)' },
                }),
              }}
            />
            <CardContent>
              <Typography
                sx={{
                  fontSize: kids ? 16 : 15,
                  fontWeight: kids ? 800 : 700,
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {decodeTitle(v.title)}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, fontWeight: kids ? 600 : 400 }}>
                {decodeTitle(v.channelName)}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}
