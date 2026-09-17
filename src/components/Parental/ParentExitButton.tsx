import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { verifyParentPin } from "../../api/parentalApi";
export default function ParentExitButton() {
  const [open, setOpen] = useState(false),
    [pin, setPin] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const unlock = async () => {
    setBusy(true);
    setError("");
    try {
      if (!(await verifyParentPin("primary", pin)))
        throw new Error("Incorrect PIN. Please ask your parent.");
      localStorage.removeItem("ytui_active_mode");
      navigate("/parent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to verify PIN.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<LockOutlined />}
        onClick={() => setOpen(true)}
        sx={{
          minHeight: 44,
          whiteSpace: "nowrap",
          flexShrink: 0,
          textTransform: "none",
          borderRadius: 3,
        }}
      >
        Parent exit
      </Button>
      <Dialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Enter parent PIN</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Parent PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void unlock();
            }}
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 12 } }}
            sx={{ mt: 1 }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={() => void unlock()}
            disabled={busy || !pin}
            variant="contained"
          >
            Unlock
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
