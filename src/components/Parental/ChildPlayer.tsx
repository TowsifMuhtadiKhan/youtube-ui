import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import AddAlarmIcon from "@mui/icons-material/AddAlarm";
import {
  addExtraBonusMinutes,
  getOrCreateChildId,
  trackWatchTime,
  validateVideoPlayback,
  verifyParentPin,
} from "../../api/parentalApi";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const ChildPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const childId = getOrCreateChildId();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [denialReason, setDenialReason] = useState<string | null>(null);
  const [denialMessage, setDenialMessage] = useState<string>("");

  // Screen time state
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [, setTotalAllowedMinutes] = useState(60);
  const [, setWatchedSeconds] = useState(0);
  const [isTimeFinished, setIsTimeFinished] = useState(false);

  // Player state
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(false);
  const unsyncedSecondsRef = useRef(0);
  const tickerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Parent unlock dialog for extra time
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [parentPinInput, setParentPinInput] = useState("");
  const [bonusOption, setBonusOption] = useState<10 | 30>(10);
  const [unlockError, setUnlockError] = useState("");
  const [grantingTime, setGrantingTime] = useState(false);

  // Exit PIN dialog
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitPinInput, setExitPinInput] = useState("");
  const [exitPinError, setExitPinError] = useState("");

  // Clean up ticker and player
  const stopTicker = () => {
    if (tickerIntervalRef.current) {
      clearInterval(tickerIntervalRef.current);
      tickerIntervalRef.current = null;
    }
  };

  const flushUnsyncedSeconds = async () => {
    if (!id || unsyncedSecondsRef.current <= 0) return;
    const toSync = unsyncedSecondsRef.current;
    unsyncedSecondsRef.current = 0;
    try {
      const res = await trackWatchTime(childId, id, toSync);
      setRemainingSeconds(res.remainingSeconds);
      setWatchedSeconds(res.watchedSeconds);
      if (!res.allowed || res.remainingSeconds <= 0) {
        handleTimeExpired();
      }
    } catch (err) {
      console.error("Watch time sync error:", err);
      unsyncedSecondsRef.current += toSync;
      setAllowed(false);
      setDenialReason("ERROR");
      setDenialMessage("Playback stopped because screen time could not be verified. Please return to Kids Zone and try again.");
    }
  };

  const handleTimeExpired = () => {
    setIsTimeFinished(true);
    stopTicker();
    if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      try {
        playerRef.current.pauseVideo();
      } catch {
        // ignore
      }
    }
  };

  // Start active watch ticker only when video is PLAYING
  const startTicker = () => {
    stopTicker();
    tickerIntervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;

      unsyncedSecondsRef.current += 1;
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          handleTimeExpired();
          return 0;
        }
        return next;
      });

      setWatchedSeconds((prev) => prev + 1);

      // Sync with backend every 5 seconds of active watch time
      if (unsyncedSecondsRef.current >= 5) {
        void flushUnsyncedSeconds();
      }
    }, 1000);
  };

  // 1. Validate video on backend first
  useEffect(() => {
    let isMounted = true;
    localStorage.setItem("ytui_active_mode", "child");
    setAllowed(false);
    setIsTimeFinished(false);

    const validate = async () => {
      if (!id) {
        navigate("/kids");
        return;
      }

      setLoading(true);
      try {
        const result = await validateVideoPlayback(childId, id);
        if (!isMounted) return;

        if (result.allowed) {
          setAllowed(true);
          setRemainingSeconds(result.remainingSeconds || 0);
          setTotalAllowedMinutes(result.totalAllowedMinutes || 60);
          setWatchedSeconds(result.watchedSeconds || 0);

        } else {
          setAllowed(false);
          setDenialReason(result.reason || "UNAPPROVED");
          setDenialMessage(result.message || "Video cannot be played.");
          if (result.reason === "TIME_EXPIRED") {
            setIsTimeFinished(true);
          }
        }
      } catch (err) {
        console.error("Playback validation failed:", err);
        if (isMounted) {
          setAllowed(false);
          setDenialReason("ERROR");
          setDenialMessage("Unable to verify video approval with server.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void validate();

    return () => {
      isMounted = false;
      stopTicker();
      void flushUnsyncedSeconds();
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [id, childId]);

  useEffect(() => {
    if (loading || !allowed || isTimeFinished || !id) return;
    initYouTubePlayer(id);
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
      stopTicker();
      isPlayingRef.current = false;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [loading, allowed, isTimeFinished, id]);
  // 2. Initialize YouTube IFrame Player API
  const initYouTubePlayer = (videoId: string) => {
    const setup = () => {
      if (!window.YT || !window.YT.Player || !document.getElementById("youtube-child-iframe-container")) return;

      playerRef.current = new window.YT.Player("youtube-child-iframe-container", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          fs: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            // Ready
          },
          onStateChange: (event: any) => {
            const state = event.data;
            // YT.PlayerState.PLAYING === 1
            if (state === 1) {
              isPlayingRef.current = true;
              startTicker();
            } else {
              // Paused (2), Ended (0), Buffering (3), Cued (5)
              isPlayingRef.current = false;
              stopTicker();
              void flushUnsyncedSeconds();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      setup();
    } else {
      // Load YouTube IFrame API script dynamically
      const existing = document.getElementById("youtube-iframe-api-script");
      if (!existing) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode?.insertBefore(tag, firstScript);
      }
      window.onYouTubeIframeAPIReady = () => {
        setup();
      };
    }
  };

  const handleGrantBonus = async () => {
    setUnlockError("");
    setGrantingTime(true);
    try {
      const isValid = await verifyParentPin(childId, parentPinInput.trim());
      if (!isValid) {
        setUnlockError("Incorrect Parent PIN.");
        setGrantingTime(false);
        return;
      }

      const updated = await addExtraBonusMinutes(childId, bonusOption);
      setRemainingSeconds(updated.remainingSeconds);
      setTotalAllowedMinutes(updated.totalAllowedMinutes);
      setIsTimeFinished(false);
      const validation = await validateVideoPlayback(childId, id!);
      setAllowed(validation.allowed);
      setDenialReason(validation.reason || null);
      setDenialMessage(validation.message || "Unable to play video.");
      setUnlockDialogOpen(false);
      setParentPinInput("");

      // Resume playback
      if (playerRef.current && typeof playerRef.current.playVideo === "function") {
        playerRef.current.playVideo();
      }
    } catch (err) {
      console.error("Failed to grant bonus time:", err);
      setUnlockError("Failed to update bonus time.");
    } finally {
      setGrantingTime(false);
    }
  };

  const handleExitToParent = async () => {
    setExitPinError("");
    try {
      const isValid = await verifyParentPin(childId, exitPinInput.trim());
      if (isValid) {
        localStorage.removeItem("ytui_active_mode");
        navigate("/parent");
      } else {
        setExitPinError("Incorrect Parent PIN. Please try again.");
      }
    } catch {
      setExitPinError("PIN verification error.");
    }
  };

  const remainingMins = Math.ceil(remainingSeconds / 60);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#060709" : "#f0f4f8",
        p: { xs: 1.5, md: 3 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Child Top Bar (Safe & Simple) */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        p={1.5}
        borderRadius={3}
        sx={{
          backgroundColor: isDark ? "#121722" : "#ffffff",
          boxShadow: isDark
            ? "0 4px 16px rgba(0,0,0,0.5)"
            : "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            void flushUnsyncedSeconds();
            navigate("/kids");
          }}
          sx={{
            fontWeight: 700,
            textTransform: "none",
            fontSize: "1rem",
            color: "primary.main",
          }}
        >
          Back to Approved Videos
        </Button>

        {/* Screen time indicator */}
        <Box display="flex" alignItems="center" gap={1}>
          <AccessTimeIcon color={remainingMins > 10 ? "primary" : "error"} />
          <Typography
            variant="body1"
            fontWeight={800}
            color={remainingMins > 10 ? "text.primary" : "error.main"}
          >
            {remainingSeconds > 0 ? `${remainingMins} min left today` : "Time finished"}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<LockIcon />}
          onClick={() => setExitDialogOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            color: "text.secondary",
            borderColor: "divider",
          }}
        >
          Parent Exit
        </Button>
      </Box>

      {/* Main Content Area */}
      <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center">
        {loading ? (
          <Box textAlign="center" py={10}>
            <CircularProgress size={50} color="primary" />
            <Typography variant="h6" fontWeight={700} mt={2}>
              Verifying video safety...
            </Typography>
          </Box>
        ) : !allowed && denialReason !== "TIME_EXPIRED" ? (
          <Card
            sx={{
              maxWidth: 550,
              p: 4,
              textAlign: "center",
              borderRadius: 4,
              backgroundColor: isDark ? "#141822" : "#ffffff",
              boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
            }}
          >
            <BlockIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography variant="h5" fontWeight={800} mb={1}>
              Video Not Approved
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {denialMessage}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/kids")}
              sx={{ borderRadius: 3, px: 4, py: 1.2, textTransform: "none", fontWeight: 700 }}
            >
              Return to My Videos
            </Button>
          </Card>
        ) : isTimeFinished ? (
          <Card
            sx={{
              maxWidth: 600,
              p: 5,
              textAlign: "center",
              borderRadius: 4,
              backgroundColor: isDark ? "#141822" : "#ffffff",
              boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
              border: "3px solid #ff9800",
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 72, color: "warning.main", mb: 2 }} />
            <Typography variant="h4" fontWeight={900} mb={1}>
              Screen Time Finished! 🌟
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4} fontSize="1.1rem">
              You reached your daily watch limit for today. Great job learning and having fun!
            </Typography>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate("/kids")}
                sx={{ borderRadius: 3, px: 3, textTransform: "none", fontWeight: 700 }}
              >
                Back to Kids Home
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={<LockIcon />}
                onClick={() => setUnlockDialogOpen(true)}
                sx={{ borderRadius: 3, px: 3, textTransform: "none", fontWeight: 700 }}
              >
                Parent: Give Extra Time
              </Button>
            </Box>
          </Card>
        ) : (
          /* Active YouTube IFrame Player */
          <Box
            ref={playerContainerRef}
            sx={{
              width: "100%",
              maxWidth: 1100,
              aspectRatio: "16/9",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: isDark
                ? "0 16px 48px rgba(0,0,0,0.8)"
                : "0 16px 48px rgba(0,0,0,0.15)",
              backgroundColor: "#000",
            }}
          >
            <div
              id="youtube-child-iframe-container"
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        )}
      </Box>

      {/* Parent Bonus Time Dialog */}
      <Dialog
        open={unlockDialogOpen}
        onClose={() => setUnlockDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Parent: Grant Extra Time</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter your Parent PIN to grant extra watch time for your child today:
          </Typography>

          <Box display="flex" gap={1.5} mb={2.5}>
            <Button
              fullWidth
              variant={bonusOption === 10 ? "contained" : "outlined"}
              onClick={() => setBonusOption(10)}
              startIcon={<AddAlarmIcon />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              +10 Minutes
            </Button>
            <Button
              fullWidth
              variant={bonusOption === 30 ? "contained" : "outlined"}
              onClick={() => setBonusOption(30)}
              startIcon={<AddAlarmIcon />}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              +30 Minutes
            </Button>
          </Box>

          <TextField
            fullWidth
            label="Parent PIN"
            type="password"
            size="small"
            value={parentPinInput}
            onChange={(e) => setParentPinInput(e.target.value)}
            placeholder="Enter 4-digit PIN"
          />

          {unlockError && (
            <Typography variant="caption" color="error" display="block" mt={1}>
              {unlockError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUnlockDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGrantBonus}
            disabled={grantingTime}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            {grantingTime ? <CircularProgress size={20} /> : "Grant Time"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Parent Exit Dialog */}
      <Dialog
        open={exitDialogOpen}
        onClose={() => setExitDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Parent Verification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter Parent PIN to return to Parent Mode:
          </Typography>

          <TextField
            fullWidth
            label="Parent PIN"
            type="password"
            size="small"
            value={exitPinInput}
            onChange={(e) => setExitPinInput(e.target.value)}
            placeholder="Enter 4-digit PIN (default 1234)"
          />

          {exitPinError && (
            <Typography variant="caption" color="error" display="block" mt={1}>
              {exitPinError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExitDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExitToParent}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Enter Parent Mode
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChildPlayer;
