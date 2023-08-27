/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DesktopDatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import React from "react";
import { Controller } from "react-hook-form";

type DateInputProps = {
  name: string;
  label: string;
  control: any;
  value: Dayjs | null;
  onChange: (newDate: Dayjs | null) => void;
};

const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  value,
  control,
  onChange,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DesktopDatePicker
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
