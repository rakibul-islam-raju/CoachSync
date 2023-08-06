import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material";
import { ChangeEvent, FC } from "react";

type CheckboxInputProps = CheckboxProps & {
	onChangeHandler: (e: ChangeEvent<HTMLInputElement>) => void;
	label: string;
};

const CheckboxInput: FC<CheckboxInputProps> = ({
	onChangeHandler,
	label,
	...rest
}) => {
	return (
		<FormControlLabel
			control={<Checkbox {...rest} onChange={onChangeHandler} />}
			label={label}
		/>
	);
};

export default CheckboxInput;
