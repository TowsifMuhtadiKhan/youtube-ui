import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  addToPlaylist,
  decodeTitle,
  deletePlaylist,
  listPlaylists,
  listVideos,
  newPlaylist,
  removeFromPlaylist,
  type Audience,
  type LibraryPlaylist,
  type VideoInput,
} from "../api/libraryApi";
export default function PlaylistPage({
  isSidebarExpanded,
}: {
  isSidebarExpanded: boolean;
}) {
  const navigate = useNavigate();
  const [audience, setAudience] = useState<Audience>("parent"),
    [playlists, setPlaylists] = useState<LibraryPlaylist[]>([]),
    [videos, setVideos] = useState<VideoInput[]>([]),
    [name, setName] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({}),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update playlist.");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    let active = true;
    setLoading(true);
    setSelected({});
    setError("");
    Promise.all([listPlaylists(audience), listVideos(audience)])
      .then(([p, v]) => {
        if (active) {
          setPlaylists(p);
          setVideos(v);
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
  const update = (p: LibraryPlaylist) =>
    setPlaylists((old) => old.map((item) => (item.id === p.id ? p : item)));
  return (
    <Box
      component="main"
      sx={{
        ml: { xs: 0, md: isSidebarExpanded ? "242px" : "104px" },
        mt: "88px",
        p: { xs: 2, md: 3 },
        pb: 10,
      }}
    >
      <Typography component="h1" sx={{ fontSize: 28, fontWeight: 800, mb: 1 }}>
        Playlists
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Make your own collections and separate collections for your child.
      </Typography>
      <ToggleButtonGroup
        exclusive
        value={audience}
        onChange={(_, v) => {
          if (v && !busy) setAudience(v);
        }}
        fullWidth
        sx={{ maxWidth: 480, mb: 3 }}
      >
        <ToggleButton value="parent">My playlists</ToggleButton>
        <ToggleButton value="kids">Kids playlists</ToggleButton>
      </ToggleButtonGroup>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            const p = await newPlaylist(audience, name.trim());
            setPlaylists((old) => [p, ...old]);
            setName("");
          });
        }}
        sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}
      >
        <TextField
          label="Playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 0 }}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={busy || !name.trim()}
        >
          Create playlist
        </Button>
        <Button onClick={() => navigate("/parent")}>Find videos</Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <CircularProgress />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0,1fr)",
              lg: "repeat(2,minmax(0,1fr))",
            },
            gap: 3,
          }}
        >
          {playlists.map((p) => (
            <Card
              key={p.id}
              sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, minWidth: 0 }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  {p.name}
                </Typography>
                <Button
                  color="error"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await deletePlaylist(audience, p.id);
                      setPlaylists((old) => old.filter((x) => x.id !== p.id));
                    })
                  }
                >
                  Delete
                </Button>
              </Box>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {p.items.length} videos
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Add a saved video"
                  value={selected[p.id] || ""}
                  onChange={(e) =>
                    setSelected((old) => ({ ...old, [p.id]: e.target.value }))
                  }
                >
                  <MenuItem value="">Choose a video</MenuItem>
                  {videos
                    .filter(
                      (v) =>
                        !p.items.some((i) => i.videoId === v.youtubeVideoId),
                    )
                    .map((v) => (
                      <MenuItem
                        value={v.youtubeVideoId}
                        key={v.youtubeVideoId}
                        sx={{ whiteSpace: "normal" }}
                      >
                        {decodeTitle(v.title)}
                      </MenuItem>
                    ))}
                </TextField>
                <Button
                  disabled={busy || !selected[p.id]}
                  onClick={() =>
                    void run(async () => {
                      const video = videos.find(
                        (v) => v.youtubeVideoId === selected[p.id],
                      );
                      if (video)
                        update(await addToPlaylist(audience, p.id, video));
                      setSelected((old) => ({ ...old, [p.id]: "" }));
                    })
                  }
                >
                  Add
                </Button>
              </Box>
              {p.items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    py: 1,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Button
                    onClick={() =>
                      navigate(
                        (audience === "kids" ? "/kids/watch/" : "/watch/") +
                          item.videoId,
                      )
                    }
                    sx={{
                      display: "flex",
                      gap: 1,
                      p: 0,
                      flexGrow: 1,
                      minWidth: 0,
                      textAlign: "left",
                      justifyContent: "flex-start",
                      textTransform: "none",
                    }}
                  >
                    <Box
                      component="img"
                      src={item.thumbnail}
                      alt=""
                      sx={{
                        width: 90,
                        aspectRatio: "16/9",
                        objectFit: "cover",
                        borderRadius: 1,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 600,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {decodeTitle(item.title)}
                    </Typography>
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    disabled={busy}
                    onClick={() =>
                      void run(async () =>
                        update(
                          await removeFromPlaylist(
                            audience,
                            p.id,
                            item.videoId,
                          ),
                        ),
                      )
                    }
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              {!p.items.length && (
                <Typography color="text.secondary">
                  Add saved videos above, or search in Parent Mode.
                </Typography>
              )}
            </Card>
          ))}
          {!playlists.length && (
            <Typography color="text.secondary">
              Create your first {audience === "kids" ? "kids" : "personal"}{" "}
              playlist above.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
