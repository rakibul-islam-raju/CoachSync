/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextFieldProps } from "@mui/material";
import { HTMLInputTypeAttribute } from "react";
import { Control, Controller, useFormContext } from "react-hook-form";
import TextInput from "./TextInput";

type FormInputProps = {
  name: string;
  label: string;
  type: HTMLInputTypeAttribute;
  control?: unknown;
  placeholder?: string;
  inputProps?: Record<string, unknown>;
  multiline?: boolean;
  helperText?: string | null;
  disabled?: boolean;
} & TextFieldProps;

export const FormInputText = ({
  name,
  label,
  type,
  control,
  placeholder,
  inputProps,
  helperText,
  error,
  ...rest
}: FormInputProps) => {
  const methods = useFormContext();
  const formControl = (control ?? methods?.control) as Control<any, any, any>;

  return (
    <Controller
      name={name}
      control={formControl}
      render={({
        field: { onChange, value, ...field },
        fieldState: { error: fieldError },
      }) => (
        <TextInput
          {...field}
          {...rest}
          helperText={helperText ?? fieldError?.message}
          error={error ?? !!fieldError}
          onChange={
            type === "number" ? e => onChange(+e.target.value) : onChange
          }
          value={value ?? ""}
          label={label}
          type={type}
          placeholder={placeholder}
          slotProps={{ input: inputProps } as TextFieldProps["slotProps"]}
        />
      )}
    />
  );
};
