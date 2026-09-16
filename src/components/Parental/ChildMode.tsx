import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LockIcon from "@mui/icons-material/Lock";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import StarIcon from "@mui/icons-material/Star";
import {
  fetchApprovedVideos,
  fetchScreenTime,
  getOrCreateChildId,
  verifyParentPin,
  type ApprovedVideo,
  type ScreenTimeData,
} from "../../api/parentalApi";

const ChildMode: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const childId = getOrCreateChildId();

  const [videos, setVideos] = useState<ApprovedVideo[]>([]);
  const [screenTime, setScreenTime] = useState<ScreenTimeData | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  // Parent exit dialog
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [approved, st] = await Promise.all([
        fetchApprovedVideos(childId),
        fetchScreenTime(childId),
      ]);
      setVideos(approved);
      setScreenTime(st);
    } catch (err) {
      console.error("Failed to load kids mode data:", err);
      setError("Unable to load approved videos and screen time. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("ytui_active_mode", "child");
    void loadData();
  }, []);

  const handleExit = async () => {
    setPinError("");
    try {
      const isValid = await verifyParentPin(childId, pinInput.trim());
      if (isValid) {
        localStorage.removeItem("ytui_active_mode");
        navigate("/parent");
      } else {
        setPinError("Incorrect PIN. Please ask your parent.");
      }
    } catch {
      setPinError("Verification error.");
    }
  };

  const remainingMinutes = screenTime ? Math.ceil(screenTime.remainingSeconds / 60) : 0;
  const isTimeUp = screenTime ? screenTime.remainingSeconds <= 0 : false;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#0a0c12" : "#f3f7fb",
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Friendly Kids Top Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        p={2}
        borderRadius={4}
        sx={{
          background: isDark
            ? "linear-gradient(135deg, #182236 0%, #101624 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #e8f0fe 100%)",
          boxShadow: isDark
            ? "0 6px 20px rgba(0,0,0,0.5)"
            : "0 6px 20px rgba(0,0,0,0.06)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "#ff5722",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(255, 87, 34, 0.4)",
            }}
          >
            <StarIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={900} color="primary">
              Kids Video Zone
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Safe, Parent-Approved Videos Only
            </Typography>
          </Box>
        </Box>

        {/* Screen Time Badge */}
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            icon={<HourglassEmptyIcon />}
            label={
              isTimeUp
                ? "Screen Time Finished"
                : `${remainingMinutes} min screen time left`
            }
            color={isTimeUp ? "error" : remainingMinutes > 15 ? "success" : "warning"}
            sx={{
              fontWeight: 800,
              fontSize: { xs: "0.8rem", sm: "0.95rem" },
              py: 2.2,
              px: 1,
              borderRadius: 3,
            }}
          />

          <Button
            variant="outlined"
            size="small"
            startIcon={<LockIcon />}
            onClick={() => setExitDialogOpen(true)}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              color: "text.secondary",
              borderColor: "divider",
            }}
          >
            Parent Exit
          </Button>
        </Box>
      </Box>

      {/* Screen Time Finished Alert Banner */}
      {isTimeUp && (
        <Card
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            textAlign: "center",
            backgroundColor: isDark ? "rgba(244, 67, 54, 0.12)" : "#ffebee",
            border: "2px solid #ef5350",
          }}
        >
          <Typography variant="h5" fontWeight={800} color="error" mb={1}>
            Your screen time is finished for today! 🌟
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You've watched all your allowed videos for today. Ask a parent if you need more
            time.
          </Typography>
        </Card>
      )}

      {/* Approved Videos Grid */}
      {loading ? (
        <Box textAlign="center" py={12}>
          <CircularProgress size={48} color="primary" />
          <Typography variant="body1" fontWeight={700} mt={2} color="text.secondary">
            Loading your approved videos...
          </Typography>
        </Box>
      ) : error ? (<Box textAlign="center" py={8}><Typography color="error">{error}</Typography><Button onClick={() => void loadData()}>Retry</Button></Box>) : videos.length === 0 ? (
        <Box textAlign="center" py={12}>
          <ChildCareIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" fontWeight={800} mb={1}>
            No Videos Approved Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Ask your parent to open Parent Mode and add some fun, educational videos for you!
          </Typography>
          <Button
            variant="contained"
            startIcon={<LockIcon />}
            onClick={() => setExitDialogOpen(true)}
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700, px: 3 }}
          >
            Open Parent Mode
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {videos.map((video) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={video.youtubeVideoId}>
              <Card
                onClick={() => {
                  if (!isTimeUp) {
                    navigate(`/kids/watch/${video.youtubeVideoId}`);
                  }
                }}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3.5,
                  overflow: "hidden",
                  cursor: isTimeUp ? "not-allowed" : "pointer",
                  opacity: isTimeUp ? 0.6 : 1,
                  backgroundColor: isDark ? "#141a27" : "#ffffff",
                  boxShadow: isDark
                    ? "0 8px 24px rgba(0,0,0,0.4)"
                    : "0 8px 24px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": !isTimeUp
                    ? {
                        transform: "translateY(-6px)",
                        boxShadow: isDark
                          ? "0 12px 32px rgba(0,0,0,0.7)"
                          : "0 12px 32px rgba(0,0,0,0.12)",
                      }
                    : {},
                }}
              >
                <Box position="relative">
                  <CardMedia
                    component="img"
                    height="180"
                    image={video.thumbnail}
                    alt={video.title}
                    sx={{ objectFit: "cover" }}
                  />
                  {!isTimeUp && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        right: 12,
                        backgroundColor: "rgba(0,0,0,0.75)",
                        borderRadius: "50%",
                        width: 44,
                        height: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                      }}
                    >
                      <PlayArrowIcon fontSize="medium" />
                    </Box>
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    lineHeight={1.3}
                    sx={{
                      fontSize: "1.05rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1,
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {video.channelName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Parent Exit Dialog */}
      <Dialog
        open={exitDialogOpen}
        onClose={() => setExitDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Enter Parent PIN</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Only parents can unlock and exit Child Mode. Enter your parent PIN.
          </Typography>

          <TextField
            fullWidth
            label="4-Digit Parent PIN"
            type="password"
            size="small"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Enter PIN"
          />

          {pinError && (
            <Typography variant="caption" color="error" display="block" mt={1}>
              {pinError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExitDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExit}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Unlock Parent Mode
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChildMode;
