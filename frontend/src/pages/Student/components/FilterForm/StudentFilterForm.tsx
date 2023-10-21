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
import { studentsOrderings } from "../../../../constants/student.constants";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { IStudentParams } from "../../../../redux/student/student.type";
import { resetParams, setParams } from "../../../../redux/student/studentSlice";

const StudentFilterForm: FC = () => {
  const dispatch = useAppDispatch();
  const { params } = useAppSelector(state => state.student);

  const [args, setArgs] = useState<Partial<IStudentParams> | null>(params);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setArgs({ ...args, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("args =>", args);

    dispatch(setParams({ ...args }));
  };

  const handleReset = () => {
    dispatch(resetParams());
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Filter Students
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Stack gap={1} component={"form"} onSubmit={handleSubmit}>
        <FormControl fullWidth>
          <FormLabel id="ordering">Sort by</FormLabel>
          <Select
            id="ordering"
            name="ordering"
            onChange={e => setArgs({ ...args, ordering: e.target.value })}
            value={args?.ordering}
            size="small"
          >
            {studentsOrderings.map(item => (
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

export default StudentFilterForm;
