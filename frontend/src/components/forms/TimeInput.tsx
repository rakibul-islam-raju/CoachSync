/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

type TimeInputProps = {
  name: string;
  label: string;
  value: Dayjs | null;
  onChange: (newTime: Dayjs | null) => void;
};

const TimeInput: React.FC<TimeInputProps> = ({
  name,
  label,
  value,
  onChange,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
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
