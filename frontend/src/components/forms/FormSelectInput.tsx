/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  InputProps,
  MenuItem,
  Select,
} from "@mui/material";
import { FC } from "react";
import { Controller } from "react-hook-form";

type FormSelectInputProps = {
  name: string;
  control: any;
  label?: string;
  options?: { value: string | number; label: string }[];
  inputProps?: InputProps;
  size?: "small" | "medium";
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
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        console.log("vaaaaaaaaaaaaaaalueeeeeeeeeeee=>", value);

        return (
          <FormControl fullWidth error={!!error}>
            {label && <InputLabel>{label}</InputLabel>}
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
        );
      }}
    />
  );
};

export default FormSelectInput;
