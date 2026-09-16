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
  InputAdornment,
  LinearProgress,
  Slider,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import LockIcon from "@mui/icons-material/Lock";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddAlarmIcon from "@mui/icons-material/AddAlarm";
import { fetchSearchResults, type YouTubeVideoInfo } from "../../api/youtube";
import {
  addExtraBonusMinutes,
  approveVideo,
  fetchApprovedVideos,
  fetchScreenTime,
  getOrCreateChildId,
  removeApprovedVideo,
  setParentPin,
  updateDailyLimit,
  type ApprovedVideo,
  type ScreenTimeData,
} from "../../api/parentalApi";

interface ParentModeProps {
  isSidebarExpanded?: boolean;
}

const ParentMode: React.FC<ParentModeProps> = ({ isSidebarExpanded = true }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const childId = getOrCreateChildId();
  const sidebarWidth = isSidebarExpanded ? 242 : 104;

  const [activeTab, setActiveTab] = useState<"search" | "approved">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeVideoInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [approvedVideos, setApprovedVideos] = useState<ApprovedVideo[]>([]);
  const [screenTime, setScreenTime] = useState<ScreenTimeData | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [savingLimit, setSavingLimit] = useState(false);
  const [tempLimitMinutes, setTempLimitMinutes] = useState(60);
  const [statusMessage, setStatusMessage] = useState("");

  const [savingVideo, setSavingVideo] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // PIN settings dialog
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");

  // Load initial data
  const loadData = async () => {
    try {
      const [approvedList, st] = await Promise.all([
        fetchApprovedVideos(childId),
        fetchScreenTime(childId),
      ]);
      setApprovedVideos(approvedList);
      setScreenTime(st);
      setTempLimitMinutes(st.dailyLimitMinutes ?? 60);
    } catch (err) {
      console.error("Error loading parental data:", err);
      setStatusMessage("Unable to load parental settings. Check the backend connection and reload.");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    void loadData();

  }, []);

  const handleSearch = async (q: string) => {
    const query = q.trim();
    if (!query) return;
    setSearching(true);
    setHasSearched(true);
    setSearchResults([]);
    setStatusMessage("");
    try {
      const results = await fetchSearchResults(query, 12, true);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
      setStatusMessage(err instanceof Error ? err.message : "Failed to search YouTube videos.");
    } finally {
      setSearching(false);
    }
  };

  const isVideoApproved = (videoId: string) => {
    return approvedVideos.some((v) => v.youtubeVideoId === videoId);
  };

  const handleToggleApprove = async (video: YouTubeVideoInfo) => {
    if (savingVideo) return;
    setSavingVideo(true);
    try {
      if (isVideoApproved(video.id)) {
        const updated = await removeApprovedVideo(childId, video.id);
        setApprovedVideos(updated);
        setStatusMessage(`Removed "${video.title}" from child whitelist.`);
      } else {
        const updated = await approveVideo(childId, {
          youtubeVideoId: video.id,
          title: video.title,
          thumbnail: video.thumbnail,
          channelName: video.subTitle || "YouTube Creator",
          duration: video.duration || "",
        });
        setApprovedVideos(updated);
        setStatusMessage(`Saved "${video.title}". It is now available on Home and in Kids Zone.`);
      }
    } catch (err) {
      console.error("Failed to update approval:", err);
      setStatusMessage(err instanceof Error ? err.message : "Failed to save video.");
    } finally { setSavingVideo(false); }
  };

  const handleRemoveApproved = async (youtubeVideoId: string, title: string) => {
    try {
      const updated = await removeApprovedVideo(childId, youtubeVideoId);
      setApprovedVideos(updated);
      setStatusMessage(`Removed "${title}".`);
    } catch (err) {
      console.error("Failed to remove:", err);
      setStatusMessage("Failed to remove video.");
    }
  };

  const handleSaveLimit = async () => {
    setSavingLimit(true);
    setStatusMessage("");
    try {
      const updated = await updateDailyLimit(childId, tempLimitMinutes);
      setScreenTime(updated);
      setStatusMessage(`Daily watch limit set to ${tempLimitMinutes} minutes.`);
    } catch (err) {
      console.error("Failed to save limit:", err);
      setStatusMessage("Failed to save daily limit.");
    } finally {
      setSavingLimit(false);
    }
  };

  const handleAddBonus = async (minutes: number) => {
    try {
      const updated = await addExtraBonusMinutes(childId, minutes);
      setScreenTime(updated);
      setStatusMessage(`Added +${minutes} minutes of bonus screen time!`);
    } catch (err) {
      console.error("Failed to add bonus:", err);
      setStatusMessage("Failed to add bonus time.");
    }
  };

  const handleUpdatePin = async () => {
    setPinError("");
    setPinSuccess("");
    if (!newPinInput || newPinInput.trim().length < 4) {
      setPinError("New PIN must be at least 4 digits.");
      return;
    }
    try {
    const result = await setParentPin(childId, newPinInput.trim(), currentPinInput.trim());
    if (result.success) {
      setPinSuccess("Parent PIN updated successfully!");
      setTimeout(() => {
        setPinDialogOpen(false);
        setCurrentPinInput("");
        setNewPinInput("");
        setPinSuccess("");
      }, 1200);
    } else {
      setPinError(result.error || "Failed to update PIN. Check current PIN.");
    }
    } catch { setPinError("Unable to update PIN. Check the backend connection and try again."); }
  };

  const handleEnterChildMode = () => {
    localStorage.setItem("ytui_active_mode", "child");
    navigate("/kids");
  };

  const watchedMinutes = screenTime ? Math.floor(screenTime.watchedSeconds / 60) : 0;
  const remainingMinutes = screenTime ? Math.ceil(screenTime.remainingSeconds / 60) : 0;
  const totalLimit = screenTime ? screenTime.totalAllowedMinutes : 60;
  const progressPercent = Math.min(100, Math.round((watchedMinutes / (totalLimit || 1)) * 100));

  if (loadingInitial) return <Box sx={{ mt: "100px", ml: { md: `${sidebarWidth}px` }, p: 4 }}><CircularProgress /></Box>;

  return (
    <Box
      sx={{
        marginLeft: { xs: 0, md: `${sidebarWidth}px` },
        marginTop: "88px",
        minHeight: "calc(100vh - 88px)",
        p: { xs: 2, md: 4 },
        backgroundColor: isDark ? "#0c0d10" : "#f4f6f9",
      }}
    >
      {/* Top Header Card */}
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: isDark
            ? "linear-gradient(135deg, #1b2333 0%, #111622 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #eef2f7 100%)",
          boxShadow: isDark
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Typography variant="h4" fontWeight={800} color="primary">
                Parental Control Center
              </Typography>
              <Chip
                label="Parent Mode"
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Curate videos, set daily time limits, and protect what your child watches.
            </Typography>
          </Box>

          <Box display="flex" gap={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setPinDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Parent PIN Settings
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ChildCareIcon />}
              onClick={handleEnterChildMode}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                boxShadow: "0 4px 14px rgba(46, 125, 50, 0.35)",
              }}
            >
              Enter Child Mode
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Screen Time & Controls Grid */}
      <Grid container spacing={3} mb={3}>
        {/* Screen Time Stats Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              height: "100%",
              backgroundColor: isDark ? "#141822" : "#ffffff",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Today's Watch Time & Limits
              </Typography>
            </Box>

            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.8}>
                <Typography variant="body2" color="text.secondary">
                  Watched: <strong>{watchedMinutes} mins</strong> of{" "}
                  <strong>{totalLimit} mins</strong>
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={remainingMinutes > 0 ? "success.main" : "error.main"}
                >
                  {remainingMinutes > 0
                    ? `${remainingMinutes} mins remaining`
                    : "Time limit reached!"}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      progressPercent >= 100
                        ? "#f44336"
                        : progressPercent > 75
                        ? "#ff9800"
                        : "#4caf50",
                  },
                }}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Only actual video playback time is counted. Pausing freezes the timer.
            </Typography>

            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="body2" fontWeight={600}>
                Quick Bonus Time:
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddAlarmIcon />}
                onClick={() => handleAddBonus(10)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                +10 min
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddAlarmIcon />}
                onClick={() => handleAddBonus(30)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                +30 min
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Set Daily Limit Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              height: "100%",
              backgroundColor: isDark ? "#141822" : "#ffffff",
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={1}>
              Configure Daily Limit
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2.5}>
              Select maximum allowable watch time for your child per day:
            </Typography>

            <Box px={1} mb={2}>
              <Slider
                value={tempLimitMinutes}
                min={10}
                max={180}
                step={5}
                marks={[
                  { value: 15, label: "15m" },
                  { value: 30, label: "30m" },
                  { value: 60, label: "1h" },
                  { value: 90, label: "1.5h" },
                  { value: 120, label: "2h" },
                ]}
                valueLabelDisplay="on"
                onChange={(_, val) => setTempLimitMinutes(val as number)}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography variant="body2">
                Selected: <strong>{tempLimitMinutes} minutes/day</strong>
              </Typography>
              <Button
                variant="contained"
                onClick={handleSaveLimit}
                disabled={savingLimit}
                sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
              >
                {savingLimit ? <CircularProgress size={20} /> : "Save Limit"}
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Status / feedback alert */}
      {statusMessage && (
        <Box
          sx={{
            mb: 3,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: isDark ? "rgba(33, 150, 243, 0.15)" : "#e3f2fd",
            color: isDark ? "#90caf9" : "#1565c0",
            border: "1px solid",
            borderColor: isDark ? "rgba(33, 150, 243, 0.3)" : "#bbdefb",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          {statusMessage}
        </Box>
      )}

      {/* Whitelist / Search Section */}
      <Card
        sx={{
          borderRadius: 3,
          backgroundColor: isDark ? "#141822" : "#ffffff",
          p: { xs: 2, md: 3 },
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          borderBottom="1px solid"
          borderColor={isDark ? "rgba(255,255,255,0.08)" : "#e0e0e0"}
          pb={2}
          mb={3}
          gap={2}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              value="search"
              label="Search YouTube"
              sx={{ textTransform: "none", fontWeight: 700 }}
            />
            <Tab
              value="approved"
              label={`Approved Whitelist (${approvedVideos.length})`}
              sx={{ textTransform: "none", fontWeight: 700 }}
            />
          </Tabs>

          {activeTab === "search" && (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                void handleSearch(searchQuery);
              }}
              display="flex"
              gap={1}
              width={{ xs: "100%", sm: "auto" }}
            >
              <TextField
                size="small"
                placeholder="Search YouTube videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: "100%", sm: 320 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={searching}
                sx={{ borderRadius: 2, textTransform: "none", px: 2.5 }}
              >
                {searching ? <CircularProgress size={20} /> : "Search"}
              </Button>
            </Box>
          )}
        </Box>

        {/* Tab 1: YouTube Search Results */}
        {activeTab === "search" && (
          <Box>
            {searching ? (
              <Box textAlign="center" py={6}>
                <CircularProgress color="primary" />
                <Typography variant="body2" color="text.secondary" mt={2}>
                  Searching YouTube...
                </Typography>
              </Box>
            ) : searchResults.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="body1" color="text.secondary">
                  {hasSearched ? "No results to show. Try another search or check the message above." : "Search YouTube, then select Add to approved videos. Only your selections appear on Home and in Kids Zone."}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {searchResults.map((video) => {
                  const approved = isVideoApproved(video.id);
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={video.id}>
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 2.5,
                          overflow: "hidden",
                          border: approved ? "2px solid #4caf50" : "1px solid transparent",
                          backgroundColor: isDark ? "#1b202c" : "#fafafa",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: isDark
                              ? "0 8px 20px rgba(0,0,0,0.5)"
                              : "0 8px 20px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box position="relative">
                          <CardMedia
                            component="img"
                            height="160"
                            image={video.thumbnail}
                            alt={video.title}
                            sx={{ objectFit: "cover" }}
                          />
                          {approved && (
                            <Chip
                              icon={<CheckCircleIcon sx={{ fill: "#fff !important" }} />}
                              label="Approved"
                              color="success"
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            lineHeight={1.3}
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              mb: 0.8,
                            }}
                          >
                            {video.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {video.subTitle}
                          </Typography>
                        </CardContent>

                        <Box p={1.5} pt={0}>
                          <Button
                            fullWidth
                            variant={approved ? "outlined" : "contained"}
                            color={approved ? "error" : "primary"}
                            startIcon={
                              approved ? <DeleteOutlineIcon /> : <AddCircleOutlineIcon />
                            }
                            disabled={savingVideo}
                            onClick={() => handleToggleApprove(video)}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 700,
                            }}
                          >
                            {savingVideo ? "Saving..." : approved ? "Remove from Child" : "Add to approved videos"}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 2: Whitelist of Approved Videos */}
        {activeTab === "approved" && (
          <Box>
            {approvedVideos.length === 0 ? (
              <Box textAlign="center" py={8}>
                <ChildCareIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                <Typography variant="h6" fontWeight={700} mb={0.5}>
                  No Approved Videos Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Search YouTube on the first tab and click "Approve for Child" to build
                  the whitelist.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab("search")}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Search & Approve Videos
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {approvedVideos.map((video) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={video.youtubeVideoId}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2.5,
                        overflow: "hidden",
                        backgroundColor: isDark ? "#1b202c" : "#fafafa",
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="160"
                        image={video.thumbnail}
                        alt={video.title}
                        sx={{ objectFit: "cover" }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          lineHeight={1.3}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 0.8,
                          }}
                        >
                          {video.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {video.channelName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                          Approved on: {new Date(video.approvedAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>

                      <Box p={1.5} pt={0}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => handleRemoveApproved(video.youtubeVideoId, video.title)}
                          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                        >
                          Remove from Whitelist
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Card>

      {/* Parent PIN Settings Dialog */}
      <Dialog
        open={pinDialogOpen}
        onClose={() => setPinDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Parent PIN Configuration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            The PIN is required to exit Child Mode or adjust parent settings. Default PIN is{" "}
            <strong>1234</strong>.
          </Typography>

          <TextField
            fullWidth
            label="Current PIN"
            type="password"
            size="small"
            value={currentPinInput}
            onChange={(e) => setCurrentPinInput(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="New 4-Digit PIN"
            type="password"
            size="small"
            value={newPinInput}
            onChange={(e) => setNewPinInput(e.target.value)}
          />

          {pinError && (
            <Typography variant="caption" color="error" display="block" mt={1}>
              {pinError}
            </Typography>
          )}
          {pinSuccess && (
            <Typography variant="caption" color="success.main" display="block" mt={1}>
              {pinSuccess}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPinDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdatePin}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Update PIN
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentMode;
