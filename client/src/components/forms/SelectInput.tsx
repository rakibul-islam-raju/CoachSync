import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { FC } from "react";

type SelectInputProps = {
  name: string;
  label: string;
  value: string | undefined;
  onChange: (e: SelectChangeEvent) => void;
  options: { value: string | number; label: string }[];
};

const SelectInput: FC<SelectInputProps> = ({
  name,
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <FormControl fullWidth>
      <InputLabel id={name}>{label}</InputLabel>
      <Select
        id={name}
        name={name}
        value={value}
        label={label}
        onChange={onChange}
      >
        {options.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectInput;
