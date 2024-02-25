/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DesktopDatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

type DateInputProps = {
  name: string;
  label: string;
  value: Dayjs | null;
  onChange: (newDate: Dayjs | null) => void;
};

const DateInput: React.FC<DateInputProps> = ({
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
