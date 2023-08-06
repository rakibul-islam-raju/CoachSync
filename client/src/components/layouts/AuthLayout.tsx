import { Box, Paper, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
	return (
		<Box>
			<Stack
				direction={"row"}
				alignItems={"center"}
				justifyContent={"center"}
				minHeight={"100vh"}
			>
				<Box
					width={{ xs: 12 / 12, md: 6 / 12, xl: 4 / 12 }}
					component={Paper}
					padding={2}
					elevation={1}
					variant="outlined"
				>
					<Outlet />
				</Box>
			</Stack>
		</Box>
	);
}
