import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import SafeYouTubePlayer from "./SafeYouTubePlayer";
import ParentExitButton from "./Parental/ParentExitButton";
import ThemeToggle from './ThemeToggle';
import useAmbientColor from './useAmbientColor';
import {
  listVideos,
  recordHistory,
  trackParentHistory,
  decodeTitle,
  type Audience,
} from "../api/libraryApi";
import {
  addExtraBonusMinutes,
  trackWatchTime,
  validateVideoPlayback,
  verifyParentPin,
  type ApprovedVideo,
} from "../api/parentalApi";
export default function WatchPage({
  kids = false,
  isSidebarExpanded = false,
}: {
  kids?: boolean;
  isSidebarExpanded?: boolean;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const audience: Audience = kids ? "kids" : "parent";
  const [videos, setVideos] = useState<ApprovedVideo[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null),
    [ended, setEnded] = useState(false),
    [replay, setReplay] = useState(0),
    [reload, setReload] = useState(0);
  const [bonusOpen, setBonusOpen] = useState(false),
    [pin, setPin] = useState(""),
    [bonusError, setBonusError] = useState(""),
    [busy, setBusy] = useState(false);
  const playing = useRef(false),
    readyId = useRef(""),
    remainingRef = useRef<number | null>(null),
    recorded = useRef(false);
  const flushPending = useRef<() => void>(() => {});
  const video = videos.find((v) => v.youtubeVideoId === id);
  const ambientColor = useAmbientColor(video?.thumbnail);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setEnded(false);
    readyId.current = "";
    playing.current = false;
    recorded.current = false;
    remainingRef.current = null;
    if (kids) localStorage.setItem("ytui_active_mode", "child");
    Promise.all([
      listVideos(audience),
      kids ? validateVideoPlayback("primary", id || "") : Promise.resolve(null),
    ])
      .then(([list, validation]) => {
        if (!active) return;
        setVideos(list);
        if (!list.some((v) => v.youtubeVideoId === id))
          throw new Error("This video is not in this saved list.");
        if (
          validation &&
          !validation.allowed &&
          validation.reason !== "TIME_EXPIRED"
        )
          throw new Error(validation.message || "Video unavailable.");
        remainingRef.current = validation?.remainingSeconds ?? null;
        setRemaining(remainingRef.current);
        readyId.current = id || "";
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      playing.current = false;
    };
  }, [id, audience, kids, reload]);
  useEffect(() => {
    if (loading || error || !id || readyId.current !== id) return;
    let active = true,
      seconds = 0;
    let queue = Promise.resolve();
    const flush = () => {
      const amount = seconds;
      seconds = 0;
      if (!amount) return;
      queue = queue
        .then(async () => {
          if (kids) {
            const result = await trackWatchTime("primary", id, amount);
            if (active) {
              remainingRef.current = Math.max(
                0,
                result.remainingSeconds - seconds,
              );
              setRemaining(remainingRef.current);
              if (!result.allowed) {
                playing.current = false;
                if (result.reason === "UNAPPROVED")
                  setError("This video was removed from Kids Videos.");
              }
            }
          } else await trackParentHistory(id, amount);
        })
        .catch(() => {
          if (active) {
            playing.current = false;
            setError(
              "Unable to save watch time. Check your connection and retry.",
            );
          }
        });
    };
    flushPending.current = flush;
    const timer = window.setInterval(() => {
      if (!playing.current) return;
      seconds++;
      if (kids && remainingRef.current !== null) {
        remainingRef.current = Math.max(0, remainingRef.current - 1);
        setRemaining(remainingRef.current);
        if (remainingRef.current === 0) {
          playing.current = false;
          flush();
        }
      }
      if (seconds >= 5) flush();
    }, 1000);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      active = false;
      flushPending.current = () => {};
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [loading, error, id, kids]);
  const onPlaying = () => {
    playing.current = true;
    if (!recorded.current && id) {
      recorded.current = true;
      void recordHistory(audience, id).catch(() => {
        recorded.current = false;
      });
    }
  };
  const expired = kids && remaining === 0;
  const addBonus = async () => {
    setBusy(true);
    setBonusError("");
    try {
      if (!(await verifyParentPin("primary", pin)))
        throw new Error("Incorrect parent PIN.");
      await addExtraBonusMinutes("primary", 10);
      setBonusOpen(false);
      setPin("");
      setReload((n) => n + 1);
    } catch (e) {
      setBonusError(e instanceof Error ? e.message : "Unable to add time.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box
      component="main"
      sx={{
        ml: kids ? 0 : { xs: 0, md: isSidebarExpanded ? "242px" : "104px" },
        mt: kids ? 0 : "88px",
        p: { xs: 1.5, md: 3 },
        minHeight: "100dvh",
        pb: 8,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 3,
          p: 1.5,
          bgcolor: "background.paper",
          borderRadius: 3,
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(kids ? "/kids" : "/home")}
          sx={{ minHeight: 44, mr: "auto", textTransform: "none" }}
        >
          {kids ? "Kids Videos" : "My Videos"}
        </Button>
        {kids && (
          <>
            <Chip
              label={
                remaining === null
                  ? "Checking time?"
                  : Math.ceil(remaining / 60) + " min left today"
              }
              sx={{
                order: { xs: 3, sm: 0 },
                width: { xs: "100%", sm: "auto" },
              }}
            />
            <ThemeToggle />
            <ParentExitButton />
          </>
        )}
      </Box>
      {loading ? (
        <Box textAlign="center" py={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button onClick={() => setReload((n) => n + 1)}>Retry</Button>
          }
        >
          {error}
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0,1fr)",
              lg: "minmax(0,1fr) 320px",
            },
            gap: 3,
            alignItems: "start",
            maxWidth: 1600,
            mx: "auto",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {expired ? (
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5">Screen time finished</Typography>
                <Typography sx={{ my: 2 }}>
                  Ask a parent for more time.
                </Typography>
                <Button variant="contained" onClick={() => setBonusOpen(true)}>
                  Parent: add 10 minutes
                </Button>
              </Card>
            ) : ended ? (
              <Card
                sx={{
                  aspectRatio: "16/9",
                  minHeight: 200,
                  display: "grid",
                  placeContent: "center",
                  gap: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h5">Video finished</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setEnded(false);
                    setReplay((n) => n + 1);
                  }}
                >
                  Watch again
                </Button>
                <Button onClick={() => navigate(kids ? "/kids" : "/home")}>
                  Back to saved videos
                </Button>
              </Card>
            ) : (
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: { xs: 2, md: 3 },
                  overflow: 'visible',
                  '&::before': ambientColor ? {
                    content: '""',
                    position: 'absolute',
                    top: '-20px',
                    left: '-20px',
                    right: '-20px',
                    bottom: '-20px',
                    background: `rgba(${ambientColor}, 0.35)`,
                    filter: 'blur(40px)',
                    borderRadius: '24px',
                    pointerEvents: 'none',
                    transition: 'background 1.5s ease, filter 0.5s ease',
                    zIndex: 0,
                  } : {},
                  '&::after': ambientColor ? {
                    content: '""',
                    position: 'absolute',
                    top: '-40px',
                    left: '-40px',
                    right: '-40px',
                    bottom: '-40px',
                    background: `rgba(${ambientColor}, 0.15)`,
                    filter: 'blur(80px)',
                    borderRadius: '40px',
                    pointerEvents: 'none',
                    transition: 'background 1.5s ease, filter 0.5s ease',
                    zIndex: 0,
                  } : {},
                  '& > *': { position: 'relative', zIndex: 1 },
                }}
              >
                <SafeYouTubePlayer
                  key={(id || "") + replay}
                  videoId={id!}
                  onPlaying={onPlaying}
                  onPaused={() => {
                  playing.current = false;
                  flushPending.current();
                }}
                onEnded={() => {
                  playing.current = false;
                  setEnded(true);
                }}
              />
              </Box>
            )}
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 19, md: 24 },
                fontWeight: 800,
                lineHeight: 1.4,
                mt: 2,
                overflowWrap: "anywhere",
              }}
            >
              {decodeTitle(video?.title || "")}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2 }}
            >
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {video?.channelName?.[0] || "T"}
              </Avatar>
              <Box>
                <Typography fontWeight={700}>
                  {decodeTitle(video?.channelName || "")}
                </Typography>
                <Typography color="text.secondary">
                  {kids ? "Approved by your parent" : "Saved in My Videos"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2 }}>
              More from {kids ? "Kids Videos" : "My Videos"}
            </Typography>
            {videos
              .filter((v) => v.youtubeVideoId !== id)
              .map((v) => (
                <Card
                  key={v.youtubeVideoId}
                  sx={{ mb: 1.5, bgcolor: "transparent", boxShadow: "none" }}
                >
                  <CardActionArea
                    onClick={() =>
                      navigate(
                        (kids ? "/kids/watch/" : "/watch/") + v.youtubeVideoId,
                      )
                    }
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "flex-start",
                      p: 0.5,
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src={v.thumbnail}
                      alt=""
                      sx={{
                        width: 140,
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
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {decodeTitle(v.title)}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: 12, mt: 0.5 }}
                      >
                        {v.channelName}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              ))}
            {videos.length <= 1 && (
              <Typography color="text.secondary">
                No other saved videos yet.
              </Typography>
            )}
          </Box>
        </Box>
      )}
      <Dialog
        open={bonusOpen}
        onClose={() => setBonusOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Parent PIN</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            type="password"
            fullWidth
            label="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            sx={{ mt: 1 }}
          />
          {bonusError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {bonusError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBonusOpen(false)}>Cancel</Button>
          <Button disabled={busy} onClick={() => void addBonus()}>
            Add 10 minutes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
