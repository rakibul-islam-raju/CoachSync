/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { InputProps } from "@mui/material";
import { FC } from "react";

type FormSelectInputProps = {
  name: string;
  control: any;
  label: string;
  options?: { value: string | number; label: string }[];
  inputProps?: InputProps;
};

const FormSelectInput: FC<FormSelectInputProps> = ({
  name,
  control,
  label,
  options,
  inputProps,
  ...rest
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select
            {...rest}
            {...inputProps}
            label={label}
            onChange={onChange}
            value={value}
          >
            {options?.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default FormSelectInput;
