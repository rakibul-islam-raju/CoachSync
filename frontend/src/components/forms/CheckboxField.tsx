import { Checkbox, FormControlLabel } from "@mui/material";
import React from "react";
import {
  Control,
  Controller,
  FieldValues,
  useFormContext,
} from "react-hook-form";

type Props = {
  name: string;
  label: string;
  control?: unknown;
};

const CheckboxField: React.FC<Props> = ({ name, label, control }) => {
  const methods = useFormContext();
  const formControl = (control ?? methods?.control) as Control<FieldValues>;

  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={formControl}
          render={({ field: props }) => (
            <Checkbox
              {...props}
              checked={props.value}
              onChange={e => props.onChange(e.target.checked)}
            />
          )}
        />
      }
      label={label}
    />
  );
};

export default CheckboxField;
