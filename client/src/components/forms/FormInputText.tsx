/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
import TextInput from "./TextInput";
import { InputProps } from "@mui/material";

type FormInputProps = {
	name: string;
	control: any;
	label: string;
	type: string;
	placeholder?: string;
	inputProps?: InputProps;
};

export const FormInputText = ({
	name,
	control,
	label,
	type,
	placeholder,
	inputProps,
}: FormInputProps) => {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field: { onChange, value }, fieldState: { error } }) => (
				<TextInput
					helperText={error ? error.message : null}
					error={!!error}
					onChange={onChange}
					value={value}
					label={label}
					type={type}
					placeholder={placeholder}
					InputProps={inputProps}
				/>
			)}
		/>
	);
};
