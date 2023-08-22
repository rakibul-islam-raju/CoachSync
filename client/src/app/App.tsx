import { ThemeProvider } from "@mui/material/styles";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import BigSpinner from "../components/BigSpinner";
import { CssBaseline } from "@mui/material";
import { theme } from "./theme";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import useAuthCheck from "../hooks/useAuthCheck";
import Loader from "../components/Loader";

function App() {
  const authChecked = useAuthCheck();

  return (
    <>
      <CssBaseline />

      {!authChecked ? (
        <Loader />
      ) : (
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} fallbackElement={<BigSpinner />} />
        </ThemeProvider>
      )}

      <ToastContainer />
    </>
  );
}

export default App;
