import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "./Auth/AuthContext";
import { fetchAdminUsers, type AdminUser } from "../api/admin";

interface AdminPageProps {
  isSidebarExpanded: boolean;
}

const AdminPage: React.FC<AdminPageProps> = ({ isSidebarExpanded }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const auth = useAuth();
  const sidebarWidth = isSidebarExpanded ? 242 : 104;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!auth.user) {
        setLoading(false);
        return;
      }

      try {
        const result = await fetchAdminUsers(auth.user);
        setUsers(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load admin data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [auth.user]);

  const admins = users.filter((u) => u.role === "admin").length;
  const normalUsers = users.filter((u) => u.role === "user").length;

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
        View all registered users and admin accounts.
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
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ opacity: 0.7 }}>Total Users</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ opacity: 0.7 }}>Admins</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{admins}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography sx={{ opacity: 0.7 }}>Regular Users</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{normalUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ display: "grid", gap: 1 }}>
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{u.username}</Typography>
                    <Typography sx={{ opacity: 0.7, fontSize: 13 }}>
                      Created: {new Date(u.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: u.role === "admin" ? "error.main" : "text.primary" }}>
                    {u.role.toUpperCase()}
                  </Typography>
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
