import { Checkbox, FormControlLabel } from "@mui/material";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

type Props = {
  name: string;
  label: string;
};

const CheckboxField: React.FC<Props> = ({ name, label }) => {
  const { control } = useFormContext();
  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
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
