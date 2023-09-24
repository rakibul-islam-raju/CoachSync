import { CircularProgress, CircularProgressProps, Stack } from "@mui/material";
import { FC } from "react";

const Loader: FC<CircularProgressProps> = ({ color = "primary", ...rest }) => {
  return (
    <Stack direction={"row"} justifyContent={"center"}>
      <CircularProgress {...rest} color={color} />
    </Stack>
  );
};

export default Loader;
