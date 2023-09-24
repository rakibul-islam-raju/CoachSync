import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";
import useAuthCheck from "../hooks/useAuthCheck";
import { router } from "./router";
import { theme } from "./theme";

function App() {
  const authChecked = useAuthCheck();

  return (
    <>
      <CssBaseline />

      {!authChecked ? (
        <Loader />
      ) : (
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RouterProvider router={router} fallbackElement={<Loader />} />
          </LocalizationProvider>
        </ThemeProvider>
      )}

      <ToastContainer />
    </>
  );
}

export default App;
