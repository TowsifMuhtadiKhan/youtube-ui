import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import {
  addExtraBonusMinutes,
  fetchScreenTime,
  setParentPin,
  updateDailyLimit,
  type ScreenTimeData,
} from "../../api/parentalApi";

export default function ParentalSettings() {
  const [time, setTime] = useState<ScreenTimeData | null>(null);
  const [limit, setLimit] = useState(60);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pinOpen, setPinOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchScreenTime()
      .then((t) => {
        if (active) {
          setTime(t);
          setLimit(t.dailyLimitMinutes);
        }
      })
      .catch((e) => {
        if (active) setError(e.message || "Unable to load screen time.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);
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
  return (
    <Box sx={{ mb: 3 }}>
      {error && !pinOpen && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button onClick={() => setReload((n) => n + 1)}>Retry</Button>
          }
        >
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}
      <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Kids screen time &amp; parent PIN
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {time
            ? Math.ceil(time.remainingSeconds / 60) + " minutes remaining today"
            : "Screen time unavailable"}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <TextField
            label="Daily minutes"
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 0, max: 1440 } }}
            sx={{ width: { xs: "100%", sm: 160 } }}
          />
          <Button
            disabled={busy || loading}
            onClick={() =>
              void run(async () => {
                setTime(await updateDailyLimit("primary", limit));
                setNotice("Daily limit saved.");
              })
            }
          >
            Save limit
          </Button>
          <Button
            disabled={busy || loading}
            onClick={() =>
              void run(async () => {
                setTime(await addExtraBonusMinutes("primary", 10));
                setNotice("Added 10 minutes for your child.");
              })
            }
          >
            +10 minutes
          </Button>
          <Button onClick={() => setPinOpen(true)}>Change parent PIN</Button>
        </Box>
      </Card>
      <Dialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Change parent PIN</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            The initial PIN is 1234. Choose your own PIN before sharing Kids
            Zone.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Current PIN"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            sx={{ my: 1 }}
          />
          <TextField
            fullWidth
            type="password"
            label="New PIN (4?12 digits)"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPinOpen(false)}>Cancel</Button>
          <Button
            disabled={busy || loading}
            onClick={() =>
              void run(async () => {
                const r = await setParentPin("primary", newPin, currentPin);
                if (!r.success) throw new Error(r.error);
                setPinOpen(false);
                setCurrentPin("");
                setNewPin("");
                setNotice("PIN updated.");
              })
            }
          >
            Save PIN
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
