import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  clearHistory,
  decodeTitle,
  listHistory,
  type Audience,
  type HistoryVideo,
} from "../api/libraryApi";
import ParentExitButton from "./Parental/ParentExitButton";
import ThemeToggle from './ThemeToggle';
export default function HistoryPage({
  kids = false,
  isSidebarExpanded = false,
}: {
  kids?: boolean;
  isSidebarExpanded?: boolean;
}) {
  const navigate = useNavigate();
  const [audience, setAudience] = useState<Audience>(kids ? "kids" : "parent"),
    [items, setItems] = useState<HistoryVideo[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [confirm, setConfirm] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listHistory(audience)
      .then((v) => {
        if (active) setItems(v);
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
  }, [audience]);
  return (
    <Box
      component="main"
      sx={{
        ml: kids ? 0 : { xs: 0, md: isSidebarExpanded ? "242px" : "104px" },
        mt: kids ? 0 : "88px",
        p: { xs: 2, md: 3 },
        pb: 10,
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
        <Typography component="h1" sx={{ fontSize: 28, fontWeight: 800 }}>
          Watch history
        </Typography>
        {kids ? (
          <>
            <Button onClick={() => navigate("/kids")}>LittleLoop Kids</Button>
            <ThemeToggle />
            <ParentExitButton />
          </>
        ) : (
          <Button disabled={!items.length} onClick={() => setConfirm(true)}>
            Clear this history
          </Button>
        )}
      </Box>
      {!kids && (
        <ToggleButtonGroup
          exclusive
          value={audience}
          onChange={(_, v) => v && setAudience(v)}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="parent">My history</ToggleButton>
          <ToggleButton value="kids">Kids history</ToggleButton>
        </ToggleButtonGroup>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : items.length ? (
        <Box sx={{ display: "grid", gap: 2, maxWidth: 950 }}>
          {items.map((v) => (
            <Card key={v.youtubeVideoId} sx={{ borderRadius: 3 }}>
              <CardActionArea
                disabled={!v.available}
                onClick={() =>
                  navigate(
                    (audience === "kids" ? "/kids/watch/" : "/watch/") +
                      v.youtubeVideoId,
                  )
                }
                sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5 }}
              >
                <Box
                  component="img"
                  src={v.thumbnail}
                  alt=""
                  sx={{
                    width: { xs: 110, sm: 200 },
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {decodeTitle(v.title)}
                  </Typography>
                  <Typography color="text.secondary">
                    {new Date(v.lastWatchedAt).toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">
                    {Math.ceil(v.watchedSeconds / 60)} min watched
                    {!v.available ? " ? Removed from library" : ""}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      ) : (
        !error && (
          <Typography color="text.secondary" sx={{ py: 6 }}>
            Videos appear here after you start watching.
          </Typography>
        )
      )}
      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>
          Clear {audience === "parent" ? "your" : "kids"} watch history?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              void clearHistory(audience)
                .then(() => {
                  setItems([]);
                  setConfirm(false);
                })
                .catch((e) => {
                  setError(e.message);
                  setConfirm(false);
                });
            }}
          >
            Clear history
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
