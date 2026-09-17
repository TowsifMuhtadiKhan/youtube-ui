import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import VideoLibraryGrid from "../VideoLibraryGrid";
import { useNavigate } from "react-router-dom";
import {
  discoverYouTube,
  loadChannelVideos,
  loadYouTubePlaylist,
  type ChannelResult,
  type DiscoveryPage,
} from "../../api/youtubeDiscovery";
import {
  addToPlaylist,
  decodeTitle,
  deleteVideo,
  listPlaylists,
  listVideos,
  newPlaylist,
  saveVideo,
  type Audience,
  type LibraryPlaylist,
  type VideoInput,
} from "../../api/libraryApi";
export default function ParentMode({
  isSidebarExpanded = true,
}: {
  isSidebarExpanded?: boolean;
}) {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const mobile = useMediaQuery(useTheme().breakpoints.down("sm"));
  const [source, setSource] = useState<"videos" | "channel" | "playlist">(
    "videos",
  );
  const [channels, setChannels] = useState<ChannelResult[]>([]);
  const [browsePlaylist, setBrowsePlaylist] = useState("");
  const [nextPage, setNextPage] = useState("");
  const [audience, setAudience] = useState<Audience>("parent"),
    [tab, setTab] = useState("search"),
    [query, setQuery] = useState("");
  const [results, setResults] = useState<VideoInput[]>([]),
    [saved, setSaved] = useState<VideoInput[]>([]),
    [playlists, setPlaylists] = useState<LibraryPlaylist[]>([]);
  const [playlistId, setPlaylistId] = useState(""),
    [playlistName, setPlaylistName] = useState("");
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [searched, setSearched] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const label = audience === "parent" ? "My Videos" : "Kids Videos";
  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPlaylistId("");
    Promise.all([listVideos(audience), listPlaylists(audience)])
      .then(([v, p]) => {
        if (active) {
          setSaved(v);
          setPlaylists(p);
        }
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
  const showPage = (page: DiscoveryPage, append = false) => {
    const videos = page.videos.map((v) => ({
      youtubeVideoId: v.id,
      title: decodeTitle(v.title),
      thumbnail: v.thumbnail,
      channelName: decodeTitle(v.subTitle),
    }));
    setResults((old) =>
      append
        ? [
            ...old,
            ...videos.filter(
              (v) => !old.some((o) => o.youtubeVideoId === v.youtubeVideoId),
            ),
          ]
        : videos,
    );
    setChannels(page.channels || []);
    setBrowsePlaylist(page.playlistId || "");
    setNextPage(page.nextPageToken || "");
  };
  const search = () =>
    run(async () => {
      setSearched(true);
      setResults([]);
      setChannels([]);
      setNextPage("");
      setBrowsePlaylist("");
      showPage(await discoverYouTube(query, source));
    });
  const add = (video: VideoInput) =>
    run(async () => {
      if (playlistId) {
        const p = await addToPlaylist(audience, playlistId, video);
        setPlaylists((items) =>
          items.map((item) => (item.id === p.id ? p : item)),
        );
        setSaved(await listVideos(audience));
      } else {
        setSaved(await saveVideo(audience, video));
      }
      setNotice(
        "Added to " +
          label +
          (playlistId ? " and the selected playlist." : "."),
      );
    });
  return (
    <Box
      component="main"
      sx={{
        ml: { xs: 0, md: isSidebarExpanded ? "242px" : "104px" },
        mt: "88px",
        p: { xs: 2, md: 3 },
        pb: { xs: 10, md: 4 },
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
            Parent Mode
          </Typography>
          <Typography color="text.secondary">
            Choose what you watch and what your child can watch.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button onClick={() => navigate("/playlist")} variant="outlined">
            Manage playlists
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              localStorage.setItem("ytui_active_mode", "child");
              navigate("/kids");
            }}
          >
            Enter LittleLoop Kids
          </Button>
        </Box>
      </Box>
      <ToggleButtonGroup
        value={audience}
        exclusive
        onChange={(_, v) => {
          if (v && !busy) setAudience(v);
        }}
        fullWidth
        sx={{ mb: 3, maxWidth: 480 }}
      >
        <ToggleButton value="parent">My Videos</ToggleButton>
        <ToggleButton value="kids">Kids Videos</ToggleButton>
      </ToggleButtonGroup>
      {error && !addOpen && (
        <Alert severity="error" sx={{ mb: 2, overflowWrap: "anywhere" }}>
          {error}
        </Alert>
      )}
      {notice && !addOpen && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}
      <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6">
              {label} ({saved.length})
            </Typography>
            <Typography color="text.secondary">
              {audience === "parent"
                ? "Your saved videos, just for you."
                : "Videos you have approved for your child."}
            </Typography>
          </Box>
          <Button
            variant="contained"
            disabled={loading || busy}
            onClick={() => {
              setTab("search");
              setAddOpen(true);
            }}
          >
            Add videos
          </Button>
          <Button
            disabled={loading || busy}
            onClick={() => {
              setTab("saved");
              setAddOpen(true);
            }}
          >
            Manage saved videos
          </Button>
        </Box>
        {loading ? (
          <CircularProgress />
        ) : (
          <VideoLibraryGrid videos={saved} kids={audience === "kids"} />
        )}
      </Card>
      <Dialog
        open={addOpen}
        onClose={() => {
          if (!busy) setAddOpen(false);
        }}
        fullWidth
        maxWidth="lg"
        fullScreen={mobile}
        aria-labelledby="add-videos-title"
      >
        <DialogTitle id="add-videos-title">Add videos to {label}</DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, overflowWrap: "anywhere" }}>
              {error}
            </Alert>
          )}
          {notice && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {notice}
            </Alert>
          )}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Save to {label}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {audience === "parent"
              ? "These videos appear on your Home page only."
              : "Only these videos are available in LittleLoop Kids."}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <TextField
              select
              label="Playlist (optional)"
              value={playlistId}
              onChange={(e) => setPlaylistId(e.target.value)}
              disabled={busy || loading}
              fullWidth
            >
              <MenuItem value="">Library only</MenuItem>
              {playlists.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="New playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              fullWidth
            />
            <Button
              disabled={busy || !playlistName.trim()}
              onClick={() =>
                void run(async () => {
                  const p = await newPlaylist(audience, playlistName.trim());
                  setPlaylists((old) => [p, ...old]);
                  setPlaylistId(p.id);
                  setPlaylistName("");
                })
              }
              sx={{ flexShrink: 0 }}
            >
              Create playlist
            </Button>
          </Box>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab value="search" label="Search YouTube" />
            <Tab value="saved" label={"Saved (" + saved.length + ")"} />
          </Tabs>
          {tab === "search" && (
            <>
              <ToggleButtonGroup
                exclusive
                aria-label="Find videos by"
                value={source}
                disabled={busy}
                sx={{
                  mb: 2,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  "& .MuiToggleButton-root": {
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px !important",
                    m: "0 !important",
                    flexGrow: 1,
                  },
                }}
                onChange={(_, value) => {
                  if (!value) return;
                  setSource(value);
                  setResults([]);
                  setChannels([]);
                  setNextPage("");
                  setSearched(false);
                }}
              >
                <ToggleButton value="videos">
                  Video search or YouTube URL
                </ToggleButton>
                <ToggleButton value="channel">
                  Channel name, @handle, or URL
                </ToggleButton>
                <ToggleButton value="playlist">
                  YouTube playlist URL or ID
                </ToggleButton>
              </ToggleButtonGroup>
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void search();
                }}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                  mb: 2,
                }}
              >
                <TextField
                  fullWidth
                  label={
                    source === "videos"
                      ? "Search YouTube"
                      : source === "channel"
                        ? "Channel name or link"
                        : "YouTube playlist link or ID"
                  }
                  placeholder={
                    source === "videos"
                      ? "Search or paste a YouTube video URL"
                      : source === "channel"
                        ? "Channel name, @handle, or channel URL"
                        : "https://www.youtube.com/playlist?list=…"
                  }
                  disabled={busy}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  sx={{ minWidth: 0 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={busy || !query.trim()}
                >
                  Search
                </Button>
              </Box>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Load videos, then choose which ones to add to {label}. New
                channel uploads are never added automatically.
              </Typography>
              {channels.length > 0 && (
                <Box sx={{ display: "grid", gap: 2, mb: 2 }}>
                  <Typography>Choose a channel to view its videos:</Typography>
                  {channels.map((channel) => (
                    <Card
                      key={channel.id}
                      variant="outlined"
                      sx={{ p: 2, minWidth: 0 }}
                    >
                      <Typography
                        sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                      >
                        {decodeTitle(channel.title)}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {channel.description}
                      </Typography>
                      <Button
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            showPage(await loadChannelVideos(channel.id));
                          })
                        }
                      >
                        View videos
                      </Button>
                    </Card>
                  ))}
                </Box>
              )}
              {busy && (
                <CircularProgress
                  size={24}
                  aria-label="Loading"
                  sx={{ mb: 2 }}
                />
              )}
            </>
          )}
          {loading ? (
            <CircularProgress />
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0,1fr)",
                  sm: "repeat(2,minmax(0,1fr))",
                  lg: "repeat(3,minmax(0,1fr))",
                },
                gap: 2,
              }}
            >
              {(tab === "search" ? results : saved).map((video) => {
                const inList = saved.some(
                  (v) => v.youtubeVideoId === video.youtubeVideoId,
                );
                const inPlaylist = playlists
                  .find((p) => p.id === playlistId)
                  ?.items.some((i) => i.videoId === video.youtubeVideoId);
                return (
                  <Card
                    key={video.youtubeVideoId}
                    variant="outlined"
                    sx={{ minWidth: 0, borderRadius: 3 }}
                  >
                    <CardMedia
                      component="img"
                      image={video.thumbnail}
                      alt={video.title}
                      sx={{ aspectRatio: "16/9", objectFit: "cover" }}
                    />
                    <CardContent>
                      <Typography
                        sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                      >
                        {decodeTitle(video.title)}
                      </Typography>
                      <Typography color="text.secondary" sx={{ my: 1 }}>
                        {video.channelName}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={busy || (playlistId ? inPlaylist : inList)}
                        onClick={() => void add(video)}
                      >
                        {(playlistId ? inPlaylist : inList)
                          ? "Added"
                          : "Add to " + (playlistId ? "playlist" : label)}
                      </Button>
                      {tab === "saved" && (
                        <Button
                          fullWidth
                          color="error"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              setSaved(
                                await deleteVideo(
                                  audience,
                                  video.youtubeVideoId,
                                ),
                              );
                              setPlaylists(await listPlaylists(audience));
                            })
                          }
                        >
                          Remove from {label}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
          {tab === "search" && nextPage && (
            <Button
              disabled={busy}
              sx={{ mt: 2 }}
              onClick={() =>
                void run(async () => {
                  showPage(
                    await loadYouTubePlaylist(browsePlaylist, nextPage),
                    true,
                  );
                })
              }
            >
              Load more videos
            </Button>
          )}
          {!loading &&
            !busy &&
            !(tab === "search" && channels.length) &&
            (tab === "search" ? results : saved).length === 0 && (
              <Typography
                color="text.secondary"
                sx={{ py: 4, textAlign: "center" }}
              >
                {tab === "saved"
                  ? "No saved videos in this list yet."
                  : searched
                    ? "No results. Try another search."
                    : "Search YouTube or paste a video, channel, or playlist link."}
              </Typography>
            )}
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setAddOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
