import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  addYoutubeUrlToPlaylist,
  createPlaylist,
  fetchPlaylists,
  getOrCreateClientUserId,
  type Playlist,
} from "../api/playlistBackend";

interface PlaylistPageProps {
  isSidebarExpanded: boolean;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({ isSidebarExpanded }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const sidebarWidth = isSidebarExpanded ? 242 : 104;

  const [userId, setUserId] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState("My Playlist");
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const pageBg = isDark ? "#0b0b0b" : "#f5f6f8";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";

  const load = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchPlaylists(id);
      setPlaylists(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load playlists";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = getOrCreateClientUserId();
    setUserId(id);
    void load(id);
  }, []);

  const onCreatePlaylist = async () => {
    if (!userId || !newPlaylistName.trim()) {
      return;
    }

    setError("");
    try {
      const created = await createPlaylist(userId, newPlaylistName.trim());
      setPlaylists((prev) => [created, ...prev]);
      setNewPlaylistName("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create playlist";
      setError(message);
    }
  };

  const onAddUrl = async (playlistId: string) => {
    const youtubeUrl = (urlInputs[playlistId] || "").trim();
    if (!youtubeUrl || !userId) {
      return;
    }

    setSaving((prev) => ({ ...prev, [playlistId]: true }));
    setError("");

    try {
      const updated = await addYoutubeUrlToPlaylist(
        userId,
        playlistId,
        youtubeUrl,
      );
      setPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? updated : p)),
      );
      setUrlInputs((prev) => ({ ...prev, [playlistId]: "" }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add video";
      setError(message);
    } finally {
      setSaving((prev) => ({ ...prev, [playlistId]: false }));
    }
  };

  const hasPlaylists = useMemo(() => playlists.length > 0, [playlists]);

  return (
    <Box
      sx={{
        marginLeft: { xs: 0, md: `${sidebarWidth}px` },
        marginTop: "88px",
        minHeight: "calc(100vh - 88px)",
        p: { xs: 2, md: 3 },
        backgroundColor: pageBg,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Your Playlists
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Playlist name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Button variant="contained" onClick={onCreatePlaylist}>
          Create Playlist
        </Button>
      </Box>

      {error && (
        <Typography sx={{ color: "error.main", mb: 2 }}>{error}</Typography>
      )}

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : !hasPlaylists ? (
        <Typography sx={{ opacity: 0.8 }}>
          No playlist yet. Create one and add a YouTube URL.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {playlists.map((playlist) => (
            <Grid size={{ xs: 12, lg: 6 }} key={playlist.id}>
              <Card sx={{ backgroundColor: cardBg, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {playlist.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>
                    {playlist.items.length} video(s)
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Paste YouTube URL"
                      value={urlInputs[playlist.id] || ""}
                      onChange={(e) =>
                        setUrlInputs((prev) => ({
                          ...prev,
                          [playlist.id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="outlined"
                      disabled={!!saving[playlist.id]}
                      onClick={() => onAddUrl(playlist.id)}
                    >
                      Add
                    </Button>
                  </Box>

                  <Box sx={{ display: "grid", gap: 1.2 }}>
                    {playlist.items.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.03)"
                            : "#f8f8f8",
                        }}
                      >
                        <Box
                          component="img"
                          src={item.thumbnail}
                          alt={item.title}
                          sx={{
                            width: 88,
                            height: 50,
                            borderRadius: 1,
                            objectFit: "cover",
                          }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{ fontSize: 14, fontWeight: 600 }}
                            noWrap
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            sx={{ fontSize: 12, opacity: 0.7 }}
                            noWrap
                          >
                            {item.url}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PlaylistPage;
