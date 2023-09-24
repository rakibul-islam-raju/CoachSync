import {
  Box,
  Divider,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { FC, FormEvent, useEffect, useState } from "react";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import { scheduleOrderings } from "../../../../constants/schedule.constants";
import { useGetBatchesQuery } from "../../../../redux/batch/batchApi";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { IScheduleParams } from "../../../../redux/schedule/schedule.type";
import {
  resetParams,
  setParams,
} from "../../../../redux/schedule/scheduleSlice";
import { useGetSubjectsQuery } from "../../../../redux/subject/subjectApi";
import { useGetTeachersQuery } from "../../../../redux/teacher/teacherApi";

const ScheduleFilterForm: FC = () => {
  const dispatch = useAppDispatch();
  const { params } = useAppSelector(state => state.schedule);

  const { data: subs } = useGetSubjectsQuery({
    limit: 50,
    offset: 0,
  });
  const { data: batches } = useGetBatchesQuery({
    limit: 50,
    offset: 0,
  });
  const { data: teachers } = useGetTeachersQuery({
    limit: 50,
    offset: 0,
  });

  const [args, setArgs] = useState<Partial<IScheduleParams> | null>(params);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setParams({ ...args }));
  };

  const handleReset = () => {
    dispatch(resetParams());
  };

  useEffect(() => {
    if (params.start_date) {
      setStartDate(dayjs(params.start_date));
    }
    if (params.end_date) {
      setStartDate(dayjs(params.end_date));
    }
  }, [params]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Filter Schedule
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
            {scheduleOrderings.map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel id="subject">Subject</FormLabel>
          <Select
            labelId="demo-simple-select-label"
            id="subject"
            name="subject"
            onChange={e =>
              setArgs({ ...args, subject: Number(e.target.value) })
            }
            value={args?.subject}
            size="small"
          >
            {subs?.results.map(item => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel id="batch">Batch</FormLabel>
          <Select
            labelId="demo-simple-select-label"
            id="batch"
            name="batch"
            onChange={e => setArgs({ ...args, batch: Number(e.target.value) })}
            value={args?.batch}
            size="small"
          >
            {batches?.results.map(item => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel id="teacher">Teacher</FormLabel>
          <Select
            labelId="demo-simple-select-label"
            id="batteacherch"
            name="teacher"
            onChange={e =>
              setArgs({ ...args, teacher: Number(e.target.value) })
            }
            value={args?.teacher}
            size="small"
          >
            {teachers?.results.map(item => (
              <MenuItem key={item.id} value={item.id}>
                {item.user.first_name + " " + item.user.last_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={newValue => {
              setStartDate(newValue);
              setArgs({ ...args, start_date: newValue?.format("YYYY-MM-DD") });
            }}
            format="DD/MM/YYYY"
          />
        </FormControl>
        <FormControl fullWidth>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={newValue => {
              setEndDate(newValue);
              setArgs({ ...args, end_date: newValue?.format("YYYY-MM-DD") });
            }}
            format="DD/MM/YYYY"
          />
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

export default ScheduleFilterForm;
