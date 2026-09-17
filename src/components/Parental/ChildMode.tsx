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

const RAINBOW = ['#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#9B5DE5', '#F15BB5'];

export default function ChildMode() {
  const navigate = useNavigate();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
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
        background: dark
          ? 'linear-gradient(180deg, #182633 0%, #0f1923 30%, #0f1923 100%)'
          : 'linear-gradient(180deg, #FFE8D6 0%, #FFF5E1 30%, #FFF5E1 100%)',
      }}
    >
      {/* ✨ Fun Header */}
      <Box
        component="header"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          py: 2,
          px: { xs: 1, sm: 2 },
          mb: 3,
          borderRadius: 4,
          background: dark
            ? 'linear-gradient(135deg, rgba(17,138,178,0.12) 0%, rgba(6,214,160,0.1) 50%, rgba(255,209,102,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,209,102,0.08) 50%, rgba(78,205,196,0.08) 100%)',
          border: `2px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mr: 'auto' }}>
          <Box component="img" src="/littleloop.svg" alt="" sx={{ width: 42, height: 42 }} />
          <Box>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 22, sm: 26 },
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              LittleLoop{' '}
              <Box
                component="span"
                sx={{
                  background: dark
                    ? 'linear-gradient(135deg, #FFD166, #06D6A0)'
                    : 'linear-gradient(135deg, #FF6B6B, #FFD166)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Kids
              </Box>
              <Box component="span" sx={{ fontSize: 22 }}>🌟</Box>
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              Picked by your parent 💙
            </Typography>
          </Box>
        </Box>
        <ThemeToggle />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap' }}>
          <Chip
            label={
              loading
                ? '⏳ Checking screen time...'
                : time
                  ? expired
                    ? '⏰ Screen time finished'
                    : '⏳ ' + Math.ceil(time.remainingSeconds / 60) + ' minutes left today'
                  : 'Screen time unavailable'
            }
            sx={{
              mr: 'auto',
              height: 38,
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 50,
              bgcolor: expired
                ? (dark ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.15)')
                : (dark ? 'rgba(255,209,102,0.15)' : 'rgba(255,209,102,0.2)'),
              color: expired
                ? (dark ? '#FF6B6B' : '#d63031')
                : (dark ? '#FFD166' : '#e17055'),
              border: `1.5px solid ${expired ? (dark ? 'rgba(255,107,107,0.3)' : 'rgba(255,107,107,0.2)') : (dark ? 'rgba(255,209,102,0.2)' : 'rgba(255,209,102,0.3)')}`,
            }}
          />
          <ParentExitButton />
        </Box>
      </Box>

      {/* 🎬 Navigation */}
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
          <Tab value="videos" label="🎬 Videos" />
          <Tab value="playlists" label="📋 Playlists" />
        </Tabs>
        <Button
          startIcon={<HistoryRounded />}
          onClick={() => navigate("/kids/history")}
          sx={{ minHeight: 44 }}
        >
          History
        </Button>
      </Box>

      {/* Section Header */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          component="h2"
          sx={{
            fontSize: { xs: 24, sm: 28 },
            fontWeight: 900,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {tab === 'playlists' ? '📋 Your playlists' : '🎬 Your videos'}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 15 }}>
          {tab === 'playlists'
            ? 'Your favourites, organised by your parent.'
            : 'Choose something you would like to watch!'}
        </Typography>
      </Box>

      {loading ? (
        <Box textAlign="center" py={8}>
          <CircularProgress
            sx={{
              color: dark ? '#FFD166' : '#FF6B6B',
            }}
            size={48}
            thickness={4}
          />
          <Typography sx={{ mt: 2, fontWeight: 700, color: 'text.secondary' }}>
            Loading your videos... 🎥
          </Typography>
        </Box>
      ) : error ? (
        <Card
          sx={{
            p: 4,
            maxWidth: 520,
            mx: "auto",
            textAlign: "center",
            borderRadius: 5,
          }}
        >
          <Typography sx={{ fontSize: 48, mb: 1 }}>😢</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 1 }}>
            Oops! Something went wrong
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ overflowWrap: "anywhere", mb: 2 }}
          >
            {error}
          </Typography>
          <Button variant="contained" onClick={() => setReload((n) => n + 1)}>
            Try again ✨
          </Button>
        </Card>
      ) : (
        <>
          {expired && (
            <Alert
              severity="info"
              sx={{ mb: 3, fontSize: 15 }}
            >
              ⏰ Your screen time is finished. Ask a parent for more time!
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
                gap: 2.5,
              }}
            >
              {playlists.map((p, i) => (
                <Card
                  key={p.id}
                  sx={{
                    p: 3,
                    borderRadius: 5,
                    borderLeft: `4px solid ${RAINBOW[i % RAINBOW.length]}`,
                    cursor: 'pointer',
                    '&:hover': {
                      borderLeftWidth: '6px',
                    },
                  }}
                  onClick={() => setSelected(p.id)}
                >
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 800,
                      overflowWrap: "anywhere",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    📁 {p.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ my: 1, fontWeight: 600 }}>
                    {p.items.length} videos 🎥
                  </Typography>
                  <Button size="small">
                    Open playlist →
                  </Button>
                </Card>
              ))}
              {!playlists.length && (
                <Box textAlign="center" py={6} sx={{ gridColumn: '1 / -1' }}>
                  <Typography sx={{ fontSize: 48, mb: 1 }}>📋</Typography>
                  <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                    Your parent hasn't made a kids playlist yet.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <>
              {playlist && (
                <Box sx={{ mb: 2 }}>
                  <Button onClick={() => setSelected("")}>
                    ← Back to playlists
                  </Button>
                  <Typography variant="h5" sx={{ mt: 1 }}>📁 {playlist.name}</Typography>
                </Box>
              )}
              {visible.length ? (
                <VideoLibraryGrid videos={visible} kids disabled={expired} />
              ) : (
                <Box textAlign="center" py={8}>
                  <Typography sx={{ fontSize: 64, mb: 2 }}>🎬</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 900 }}>
                    No videos yet!
                  </Typography>
                  <Typography color="text.secondary" sx={{ my: 2, fontSize: 16 }}>
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
