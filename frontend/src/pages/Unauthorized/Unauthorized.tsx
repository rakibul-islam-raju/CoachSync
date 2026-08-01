import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../redux/auth/authApi";
import { userLoggedOut } from "../../redux/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hook";

export default function Unauthorized() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const refresh = useAppSelector(state => state.auth.refresh);
  const [logout, { isSuccess }] = useLogoutMutation();

  const handleLogout = () => {
    if (refresh) {
      logout({ refresh });
    } else {
      dispatch(userLoggedOut());
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigate("/login", { replace: true });
    }
  }, [isSuccess, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeContent: "center",
        justifyItems: "center",
        gap: 2,
        px: 3,
        textAlign: "center",
      }}
    >
      <Typography component="h1" variant="h4">
        Access denied
      </Typography>
      <Typography color="text.secondary">
        Your account does not have access to the administration workspace.
      </Typography>
      <Button
        variant="contained"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
      >
        Sign out
      </Button>
    </Box>
  );
}
