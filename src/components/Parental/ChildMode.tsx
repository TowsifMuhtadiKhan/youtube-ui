import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import VideoLibraryGrid from "../VideoLibraryGrid";
import ParentExitButton from "./ParentExitButton";
import ThemeToggle from '../ThemeToggle';
import { fetchScreenTime, type ScreenTimeData } from "../../api/parentalApi";
import {
  listPlaylists,
  listVideos,
  type LibraryPlaylist,
  type VideoInput,
} from "../../api/libraryApi";
import { useNavigate } from "react-router-dom";
export default function ChildMode() {
  const navigate = useNavigate();
  const dark = useTheme().palette.mode === 'dark';
  const [videos, setVideos] = useState<VideoInput[]>([]),
    [playlists, setPlaylists] = useState<LibraryPlaylist[]>([]),
    [time, setTime] = useState<ScreenTimeData | null>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [reload, setReload] = useState(0),
    [tab, setTab] = useState("videos"),
    [selected, setSelected] = useState("");
  useEffect(() => {
    let active = true;
    localStorage.setItem("ytui_active_mode", "child");
    setLoading(true);
    setError("");
    setTime(null);
    Promise.all([listVideos("kids"), listPlaylists("kids"), fetchScreenTime()])
      .then(([v, p, t]) => {
        if (active) {
          setVideos(v);
          setPlaylists(p);
          setTime(t);
        }
      })
      .catch((e) => {
        if (active)
          setError(e.message || "Check your connection and try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);
  const expired = !!time && time.remainingSeconds <= 0;
  const playlist = playlists.find((p) => p.id === selected);
  const visible = playlist
    ? videos.filter((v) =>
        playlist.items.some((i) => i.videoId === v.youtubeVideoId),
      )
    : videos;
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        p: { xs: 1.5, sm: 3, md: 4 },
        maxWidth: 1440,
        color: "text.primary",
        mx: "auto",
      }}
    >
      <Box component="header" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, py: 1.5, mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mr: 'auto' }}>
          <Box component="img" src="/littleloop.svg" alt="" sx={{ width: 38, height: 38 }} />
          <Box>
            <Typography component="h1" sx={{ fontSize: { xs: 19, sm: 22 }, fontWeight: 800, letterSpacing: '-0.5px', color: 'text.primary' }}>LittleLoop <Box component="span" sx={{ color: 'primary.main' }}>Kids</Box></Typography>
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>Picked by your parent</Typography>
          </Box>
        </Box>
        <ThemeToggle />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap' }}>
          <Chip
            label={loading ? 'Checking screen time...' : time ? expired ? 'Screen time finished' : Math.ceil(time.remainingSeconds / 60) + ' minutes left today' : 'Screen time unavailable'}
            sx={{ mr: 'auto', height: 34, fontSize: 12, fontWeight: 600, borderRadius: '8px', bgcolor: expired ? (dark ? '#38221e' : '#fff0e9') : 'action.hover', color: expired ? (dark ? '#ffcdb7' : '#8a3525') : 'text.secondary' }}
          />
          <ParentExitButton />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setSelected("");
          }}
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          <Tab value="videos" label="Videos" />
          <Tab value="playlists" label="Playlists" />
        </Tabs>
        <Button
          startIcon={<HistoryRounded />}
          onClick={() => navigate("/kids/history")}
          sx={{ minHeight: 44 }}
        >
          History
        </Button>
      </Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>{tab === 'playlists' ? 'Your playlists' : 'Your videos'}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14 }}>{tab === 'playlists' ? 'Your favourites, organised by your parent.' : 'Choose something you would like to watch.'}</Typography>
      </Box>
      {loading ? (
        <Box textAlign="center" py={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Card
          sx={{
            p: 3,
            maxWidth: 520,
            mx: "auto",
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>
            We couldn't load your videos
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ overflowWrap: "anywhere", mb: 2 }}
          >
            {error}
          </Typography>
          <Button variant="contained" onClick={() => setReload((n) => n + 1)}>
            Try again
          </Button>
        </Card>
      ) : (
        <>
          {expired && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Your screen time is finished. Ask a parent for more time.
            </Alert>
          )}
          {tab === "playlists" && !selected ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0,1fr)",
                  sm: "repeat(2,minmax(0,1fr))",
                  md: "repeat(3,minmax(0,1fr))",
                },
                gap: 2,
              }}
            >
              {playlists.map((p) => (
                <Card key={p.id} sx={{ p: 3, borderRadius: '14px' }}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 700,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {p.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ my: 1 }}>
                    {p.items.length} videos
                  </Typography>
                  <Button onClick={() => setSelected(p.id)}>
                    Open playlist
                  </Button>
                </Card>
              ))}
              {!playlists.length && (
                <Typography color="text.secondary">
                  Your parent hasn't made a kids playlist yet.
                </Typography>
              )}
            </Box>
          ) : (
            <>
              {playlist && (
                <Box sx={{ mb: 2 }}>
                  <Button onClick={() => setSelected("")}>
                    Back to playlists
                  </Button>
                  <Typography variant="h5">{playlist.name}</Typography>
                </Box>
              )}
              {visible.length ? (
                <VideoLibraryGrid videos={visible} kids disabled={expired} />
              ) : (
                <Box textAlign="center" py={8}>
                  <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                    No kids videos yet
                  </Typography>
                  <Typography color="text.secondary" sx={{ my: 2 }}>
                    Ask your parent to add videos to Kids Videos.
                  </Typography>
                  <ParentExitButton />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}
