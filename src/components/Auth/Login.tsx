// components/Auth/Login.tsx
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Logo from "../../assets/youtube-svgrepo-com.svg";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    color: "#f1f1f1",
    "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
    "&.Mui-focused fieldset": { borderColor: "#ff0000", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { color: "#aaa" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#ff0000" },
  "& .MuiInputAdornment-root svg": { color: "#888" },
};

const Login: React.FC = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [createAsAdmin, setCreateAsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const success = await auth.login(username, password);
      setLoading(false);
      if (success) {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        setError("Invalid username or password. Please try again.");
      }
      return;
    }

    const signupResult = await auth.signup(
      username,
      password,
      createAsAdmin ? "admin" : "user",
      adminCode,
    );
    setLoading(false);
    if (!signupResult.success) {
      setError(signupResult.message || "Unable to create account.");
      return;
    }

    const success = await auth.login(username, password);
    if (success) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } else {
      setError("Account created, but login failed. Please sign in.");
      setMode("login");
    }
  };

  return (
    <Box
      className="login-bg"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,0,0,0.12) 0%, transparent 70%)",
          top: "-10%",
          left: "-10%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,0,0,0.08) 0%, transparent 70%)",
          bottom: "5%",
          right: "-5%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <Box
        className="fade-in"
        sx={{
          width: { xs: "90%", sm: 420 },
          p: { xs: 3.5, sm: 5 },
          background: "rgba(22,22,22,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <img src={Logo} alt="TomTube" style={{ height: 36 }} />
            <Typography
              sx={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#f1f1f1",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              TomTube
            </Typography>
          </Box>
          <Typography
            sx={{ color: "#aaa", fontSize: "14px", textAlign: "center" }}
          >
            {mode === "login"
              ? "Sign in to continue watching"
              : "Create your account to continue"}
          </Typography>
        </Box>

        {/* Error */}
        <Collapse in={!!error}>
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              backgroundColor: "rgba(255,0,0,0.12)",
              color: "#ff6b6b",
              border: "1px solid rgba(255,0,0,0.25)",
              borderRadius: "10px",
              "& .MuiAlert-icon": { color: "#ff6b6b" },
            }}
          >
            {error}
          </Alert>
        </Collapse>

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "#888", "&:hover": { color: "#aaa" } }}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {mode === "signup" && (
              <>
                <TextField
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="button"
                  variant={createAsAdmin ? "contained" : "outlined"}
                  onClick={() => setCreateAsAdmin((prev) => !prev)}
                  sx={{ textTransform: "none", borderRadius: "10px" }}
                >
                  {createAsAdmin ? "Creating Admin Account" : "Create as Admin"}
                </Button>

                {createAsAdmin && (
                  <TextField
                    label="Admin Signup Code"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    sx={inputSx}
                  />
                )}
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={
                loading ||
                !username ||
                !password ||
                (mode === "signup" && !confirmPassword)
              }
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: "12px",
                background: loading
                  ? "rgba(255,0,0,0.4)"
                  : "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 700,
                textTransform: "none",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 20px rgba(255,0,0,0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #e60000 0%, #b30000 100%)",
                  boxShadow: "0 6px 28px rgba(255,0,0,0.45)",
                  transform: "translateY(-1px)",
                },
                "&:active": { transform: "translateY(0)" },
                "&.Mui-disabled": {
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.3)",
                  boxShadow: "none",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>

            <Button
              type="button"
              fullWidth
              onClick={() => {
                setMode((prev) => (prev === "login" ? "signup" : "login"));
                setError("");
                setPassword("");
                setConfirmPassword("");
                setAdminCode("");
                setCreateAsAdmin(false);
              }}
              sx={{
                color: "#bbb",
                textTransform: "none",
                fontSize: "13px",
                "&:hover": {
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              }}
            >
              {mode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
