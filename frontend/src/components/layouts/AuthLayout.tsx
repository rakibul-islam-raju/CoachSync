import { Box, Paper, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <Box>
      <Stack
        direction={"row"}
        sx={{
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh"
        }}>
        <Box
          component={Paper}
          elevation={1}
          variant="outlined"
          sx={{
            width: { xs: 12 / 12, md: 6 / 12, xl: 4 / 12 },
            padding: 2
          }}>
          <Outlet />
        </Box>
      </Stack>
    </Box>
  );
}
