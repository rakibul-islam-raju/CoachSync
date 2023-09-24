import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import { classOrderings } from "../../../../constants/class.constants";
import { IClassParams } from "../../../../redux/class/class.type";
import { resetParams, setParams } from "../../../../redux/class/classSlice";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";

const ClassFilterForm: FC = () => {
  const dispatch = useAppDispatch();
  const { params } = useAppSelector(state => state.class);

  const [args, setArgs] = useState<Partial<IClassParams> | null>(params);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setArgs({ ...args, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setParams({ ...args }));
  };

  const handleReset = () => {
    dispatch(resetParams());
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Filter Classes
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Stack gap={1} component={"form"} onSubmit={handleSubmit}>
        <FormControl fullWidth>
          <FormLabel id="ordering">Sort by</FormLabel>
          <Select
            labelId="demo-simple-select-label"
            id="ordering"
            name="ordering"
            onChange={e => setArgs({ ...args, ordering: e.target.value })}
            value={args?.ordering}
            size="small"
          >
            {classOrderings.map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel id="is_active">Active</FormLabel>
          <RadioGroup
            row
            name="is_active"
            onChange={handleChange}
            value={args?.is_active}
          >
            <FormControlLabel value={true} control={<Radio />} label="True" />
            <FormControlLabel value={false} control={<Radio />} label="False" />
          </RadioGroup>
        </FormControl>

        <Stack direction={"row"} mt={2} gap={1} justifyContent={"flex-end"}>
          <CustomButton
            type="button"
            variant="outlined"
            size="small"
            color="warning"
            onClick={handleReset}
          >
            Reset
          </CustomButton>
          <CustomButton type="submit" size="small">
            Filter
          </CustomButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ClassFilterForm;
