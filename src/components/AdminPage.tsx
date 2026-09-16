import React, { useEffect, useState } from "react";
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
import { useAuth } from "./Auth/AuthContext";
import {
  createPlaylistForUser,
  fetchAdminOverview,
  type AdminOverview,
} from "../api/admin";

interface AdminPageProps {
  isSidebarExpanded: boolean;
}

const AdminPage: React.FC<AdminPageProps> = ({ isSidebarExpanded }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const auth = useAuth();
  const sidebarWidth = isSidebarExpanded ? 242 : 104;

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playlistDrafts, setPlaylistDrafts] = useState<Record<string, string>>({});
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  const loadOverview = async () => {
    if (!auth.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminOverview(auth.user);
      setOverview(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load admin data";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, [auth.user]);

  const handleCreatePlaylist = async (userId: string) => {
    if (!auth.user) {
      return;
    }

    const playlistName = (playlistDrafts[userId] || "").trim();
    if (!playlistName) {
      return;
    }

    setCreatingFor(userId);
    setError("");
    try {
      await createPlaylistForUser(auth.user, userId, playlistName);
      setPlaylistDrafts((prev) => ({ ...prev, [userId]: "" }));
      await loadOverview();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create playlist";
      setError(message);
    } finally {
      setCreatingFor(null);
    }
  };

  return (
    <Box
      sx={{
        marginLeft: { xs: 0, md: `${sidebarWidth}px` },
        marginTop: "88px",
        minHeight: "calc(100vh - 88px)",
        p: { xs: 2, md: 3 },
        backgroundColor: isDark ? "#0b0b0b" : "#f5f6f8",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Admin Portal
      </Typography>
      <Typography sx={{ opacity: 0.75, mb: 3 }}>
        Full analytics, users, playlists and video activity.
      </Typography>

      {loading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography sx={{ color: "error.main" }}>{error}</Typography>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ opacity: 0.7 }}>Total Users</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {overview?.totals.users || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ opacity: 0.7 }}>Admins</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {overview?.totals.admins || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ opacity: 0.7 }}>Total Playlists</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {overview?.totals.playlists || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ opacity: 0.7 }}>Total Videos Added</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {overview?.totals.videos || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>All Playlists</Typography>
                  <Typography sx={{ opacity: 0.7, mb: 1, fontSize: 13 }}>
                    {overview?.playlists.length || 0} total playlists in the system.
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1, maxHeight: 240, overflow: "auto" }}>
                    {(overview?.playlists || []).slice(0, 12).map((playlist) => (
                      <Box
                        key={playlist.id}
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f6f6f6",
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{playlist.name}</Typography>
                        <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                          User: {playlist.userId} • Videos: {playlist.items.length}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>Orphan Data</Typography>
                  <Typography sx={{ opacity: 0.7, mb: 1, fontSize: 13 }}>
                    Playlists whose owner account is not in current user records.
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1, maxHeight: 240, overflow: "auto" }}>
                    {(overview?.orphanOwners || []).length === 0 ? (
                      <Typography sx={{ fontSize: 13, opacity: 0.7 }}>No orphan owner data.</Typography>
                    ) : (
                      (overview?.orphanOwners || []).map((orphan) => (
                        <Box
                          key={orphan.ownerId}
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f6f6f6",
                          }}
                        >
                          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{orphan.ownerId}</Typography>
                          <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
                            Playlists: {orphan.playlists} • Videos: {orphan.videos}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ display: "grid", gap: 1 }}>
            {(overview?.users || []).map((u) => (
              <Card key={u.id}>
                <CardContent sx={{ display: "grid", gap: 1.2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{u.username}</Typography>
                      <Typography sx={{ opacity: 0.7, fontSize: 13 }}>
                        Created: {new Date(u.createdAt).toLocaleString()} • UserId: {u.id}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: u.role === "admin" ? "error.main" : "text.primary" }}>
                      {u.role.toUpperCase()}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                    Playlists: {u.playlists || 0} • Videos added: {u.videos || 0}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <TextField
                      size="small"
                      label="Create playlist for this user"
                      value={playlistDrafts[u.id] || ""}
                      onChange={(e) =>
                        setPlaylistDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))
                      }
                      sx={{ minWidth: 240 }}
                    />
                    <Button
                      variant="contained"
                      disabled={creatingFor === u.id || !(playlistDrafts[u.id] || "").trim()}
                      onClick={() => void handleCreatePlaylist(u.id)}
                    >
                      {creatingFor === u.id ? "Adding..." : "Add Playlist"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default AdminPage;
