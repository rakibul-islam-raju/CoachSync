 
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DesktopDatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import React from "react";
import { Control, Controller, useFormContext } from "react-hook-form";

type DateInputProps = {
  name: string;
  label: string;
  control?: unknown;
  value: Dayjs | null;
  onChange: (newDate: Dayjs | null) => void;
};

const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  control,
  value,
  onChange,
}) => {
  const methods = useFormContext();
  const formControl = (control ?? methods?.control) as Control<any, any, any>;

  return (
    <Controller
      name={name}
      control={formControl}
      render={({ field, fieldState: { error } }) => (
        <DesktopDatePicker
          {...field}
          label={label}
          value={value}
          format="DD/MM/YYYY"
          onChange={newVal => onChange(newVal)}
          slotProps={{
            textField: { error: !!error, helperText: error?.message },
          }}
        />
      )}
    />
  );
};

export default DateInput;
