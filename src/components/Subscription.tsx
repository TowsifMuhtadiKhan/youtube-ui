import { Box, Typography, useTheme, Avatar } from "@mui/material";
import React from "react";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";

type SubscriptionProps = {
  isSidebarExpanded: boolean;
};

const mockChannels = [
  { name: "TomTube Originals", subs: "1.2M", avatar: "T", color: "#ff0000" },
  { name: "Cinema Vault", subs: "890K", avatar: "C", color: "#3ea6ff" },
  { name: "Series Central", subs: "420K", avatar: "S", color: "#f80" },
  { name: "Movie Magic", subs: "320K", avatar: "M", color: "#0f0" },
];

export const Subscription: React.FC<SubscriptionProps> = ({ isSidebarExpanded }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const sidebarWidth = window.innerWidth <= 600 ? 0 : isSidebarExpanded ? 232 : 72;
  const bg = isDark ? "#0f0f0f" : "#ffffff";
  const cardBg = isDark ? "#1a1a1a" : "#f5f5f5";
  const textColor = isDark ? "#f1f1f1" : "#0f0f0f";
  const metaColor = isDark ? "#aaaaaa" : "#606060";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";

  return (
    <Box
      sx={{
        marginLeft: `${sidebarWidth}px`,
        marginTop: "64px",
        minHeight: "calc(100vh - 64px)",
        backgroundColor: bg,
        transition: "margin-left 0.25s ease, background-color 0.3s ease",
        px: { xs: 2, sm: 3, md: 4 },
        py: 3,
      }}
    >
      {/* Header */}
      <Typography
        sx={{
          fontSize: { xs: "20px", md: "24px" },
          fontWeight: 800,
          color: textColor,
          letterSpacing: "-0.4px",
          mb: 0.5,
        }}
      >
        Subscriptions
      </Typography>
      <Typography sx={{ color: metaColor, fontSize: "13px", mb: 3 }}>
        Manage your subscribed channels
      </Typography>

      {/* Channel cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {mockChannels.map((ch) => (
          <Box
            key={ch.name}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              backgroundColor: cardBg,
              borderRadius: "14px",
              border: `1px solid ${borderColor}`,
              px: 2.5,
              /* Fixed height so every row is uniform */
              height: 76,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: isDark ? "#242424" : "#eaeaea",
                transform: "translateX(3px)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 44,
                height: 44,
                fontWeight: 700,
                fontSize: "18px",
                background: `linear-gradient(135deg, ${ch.color}, ${ch.color}99)`,
                flexShrink: 0,
              }}
            >
              {ch.avatar}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "14px", color: textColor }}>
                {ch.name}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: metaColor }}>
                {ch.subs} subscribers
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                borderRadius: "20px",
                px: 1.5,
                py: 0.75,
                flexShrink: 0,
                border: `1px solid ${borderColor}`,
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 16, color: metaColor }} />
              <Typography sx={{ fontSize: "12px", color: metaColor, fontWeight: 600 }}>
                Subscribed
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Empty-state hint */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: "14px",
          border: `1px dashed ${borderColor}`,
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: metaColor, fontSize: "13px" }}>
          Your subscription feed will appear here when content is available.
        </Typography>
      </Box>
    </Box>
  );
};
