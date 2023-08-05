import { ThemeProvider } from "@mui/material/styles";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import BigSpinner from "../components/BigSpinner";
import { CssBaseline } from "@mui/material";
import { theme } from "./theme";

function App() {
	return (
		<>
			<CssBaseline />
			<ThemeProvider theme={theme}>
				<RouterProvider router={router} fallbackElement={<BigSpinner />} />
			</ThemeProvider>
		</>
	);
}

export default App;
