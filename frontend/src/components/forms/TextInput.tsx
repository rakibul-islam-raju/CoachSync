import { TextField, TextFieldProps } from "@mui/material";
import { forwardRef } from "react";

const TextInput = forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => (
  <TextField {...props} ref={ref} size="small" variant="outlined" />
));

TextInput.displayName = "TextInput";

export default TextInput;
