import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import { removeNewSchedule } from "../../../../redux/schedule/scheduleSlice";

const NewScheduleList = () => {
  const dispatch = useAppDispatch();
  const { newSchedules } = useAppSelector(state => state.schedule);

  const handleRemoveItem = (uuid: string) => {
    dispatch(removeNewSchedule(uuid));
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Schedules
        </Typography>
        <Box>
          {newSchedules.map((schedule, index) => (
            <Box key={index} sx={{ borderBottom: "1px solid #ddd" }}>
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"baseline"}
              >
                <Box>
                  <Typography>Subject: {schedule.subject.name}</Typography>
                  <Typography>Date: {schedule.date}</Typography>
                  <Typography>Time: {schedule.time}</Typography>
                  <Typography>Duration: {schedule.time}</Typography>
                  <Typography>
                    Teacher:{" "}
                    {schedule.teacher ? schedule.teacher.user.first_name : ""}
                  </Typography>
                </Box>
                <IconButton onClick={() => handleRemoveItem(schedule.uuid)}>
                  <RemoveCircleIcon color="error" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewScheduleList;
