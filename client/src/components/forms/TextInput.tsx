import { TextField, TextFieldProps } from "@mui/material";
import { FC } from "react";

const TextInput: FC<TextFieldProps> = ({ ...rest }) => {
	return <TextField {...rest} size="small" variant="outlined" fullWidth />;
};

export default TextInput;
