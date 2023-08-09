import { CircularProgress, Stack } from "@mui/material";

export default function Loader() {
	return (
		<Stack direction={"row"} justifyContent={"center"}>
			<CircularProgress color="primary" />
		</Stack>
	);
}
