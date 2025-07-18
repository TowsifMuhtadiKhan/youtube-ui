import { Box, Typography } from "@mui/material";
import React from "react";

type SubscriptionProps = {
  isSidebarExpanded: boolean;
};

export const Subscription: React.FC<SubscriptionProps> = ({
  isSidebarExpanded,
}) => {
  return (
    <Box
      sx={{
        marginLeft: isSidebarExpanded ? 30 : 10,
        marginTop: 10,

        overflowY: "auto",
      }}
      px={4}
      py={2}
    >
      <Typography variant="h6">Shorts</Typography>
    </Box>
  );
};
