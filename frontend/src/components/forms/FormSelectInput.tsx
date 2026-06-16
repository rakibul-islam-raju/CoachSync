/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";
import { FC } from "react";
import { Control, Controller, useFormContext } from "react-hook-form";

type FormSelectInputProps = {
  name: string;
  label?: string;
  control?: unknown;
  options?: { value: string | number; label: string }[];
  size?: "small" | "medium";
  helperText?: string;
} & SelectProps;

const FormSelectInput: FC<FormSelectInputProps> = ({
  name,
  label,
  control,
  options,
  error,
  helperText,
  ...rest
}) => {
  const methods = useFormContext();
  const formControl = (control ?? methods?.control) as Control<any, any, any>;

  return (
    <Controller
      name={name}
      control={formControl}
      render={({ field: { onChange, value }, ...fields }) => {
        return (
          <FormControl fullWidth error={!!error}>
            {label && <InputLabel>{label}</InputLabel>}
            <Select
              {...fields}
              {...rest}
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
            {helperText && (
              <FormHelperText error={error}>{helperText}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

export default FormSelectInput;
