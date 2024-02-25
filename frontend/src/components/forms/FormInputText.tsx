/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputProps, TextFieldProps } from "@mui/material";
import { HTMLInputTypeAttribute } from "react";
import { Controller, useFormContext } from "react-hook-form";
import TextInput from "./TextInput";

type FormInputProps = {
  name: string;
  label: string;
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  inputProps?: InputProps;
  multiline?: boolean;
  helperText?: string | null;
  disabled?: boolean;
} & TextFieldProps;

export const FormInputText = ({
  name,
  label,
  type,
  placeholder,
  inputProps,
  helperText,
  error,
  ...rest
}: FormInputProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, ...fields }) => (
        <TextInput
          {...fields}
          {...rest}
          helperText={helperText}
          error={error}
          onChange={
            type === "number" ? e => onChange(+e.target.value) : onChange
          }
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
