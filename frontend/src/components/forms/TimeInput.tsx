 
/* eslint-disable @typescript-eslint/no-explicit-any */

import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import React from "react";
import { Control, Controller, useFormContext } from "react-hook-form";

type TimeInputProps = {
  name: string;
  label: string;
  control?: unknown;
  value: Dayjs | null;
  onChange: (newTime: Dayjs | null) => void;
};

const TimeInput: React.FC<TimeInputProps> = ({
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
      render={({ fieldState: { error } }) => (
        <TimePicker
          label={label}
          value={value}
          onChange={newVal => onChange(newVal)}
          slotProps={{
            textField: { error: !!error, helperText: error?.message },
          }}
        />
      )}
    />
  );
};

export default TimeInput;
