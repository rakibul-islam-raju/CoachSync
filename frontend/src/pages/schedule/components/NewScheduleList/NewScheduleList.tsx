import EditIcon from "@mui/icons-material/Edit";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FC, useEffect } from "react";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/CustomButton/CustomButton";
import ErrorDisplay from "../../../../components/ErrorDisplay/ErrorDisplay";
import { useAppDispatch, useAppSelector } from "../../../../redux/hook";
import {
  IScheduleCreateReqData,
  IScheduleDemoData,
} from "../../../../redux/schedule/schedule.type";
import { useCreateScheduleMutation } from "../../../../redux/schedule/scheduleApi";
import {
  clearDraftSchedules,
  removeDraftSchedule,
} from "../../../../redux/schedule/scheduleSlice";
import { formatDate } from "../../../../utils/formatDate";
import { formatTime } from "../../../../utils/formatTime";

type Props = {
  handleAddToEdit: (data: IScheduleDemoData) => void;
};

const NewScheduleList: FC<Props> = ({ handleAddToEdit }) => {
  const dispatch = useAppDispatch();
  const { draftSchedules } = useAppSelector(state => state.schedule);

  const [createSchedule, { isLoading, isError, error, isSuccess }] =
    useCreateScheduleMutation();

  const handleRemoveItem = (uuid: string) => {
    dispatch(removeDraftSchedule(uuid));
  };

  const handleSubmit = () => {
    if (draftSchedules.length > 0) {
      const data: IScheduleCreateReqData[] = draftSchedules.map(item => ({
        title: item.title,
        subject: item.subject.id,
        teacher: item?.teacher?.id,
        batch: item.batch.id,
        duration: item.duration,
        date: item.date,
        time: item.time,
        exam: item?.exam?.id,
      }));
      createSchedule(data);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Schedules created succeefully");
      dispatch(clearDraftSchedules());
    }
  }, [isSuccess]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Schedules
        </Typography>
        <Divider sx={{ my: 1 }} />
        {isError && <ErrorDisplay error={error} />}
        <Box mt={2}>
          {draftSchedules.length === 0 ? (
            <ErrorDisplay severity="warning" error="Please add new schedule" />
          ) : (
            <>
              {draftSchedules.map((schedule, index) => (
                <Box key={index} sx={{ borderBottom: "1px solid #ddd" }}>
                  <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"baseline"}
                  >
                    <Box>
                      <Typography>Title: {schedule.title}</Typography>
                      <Typography variant="body2">
                        Batch: {schedule.batch.name}
                      </Typography>
                      <Typography variant="body2">
                        Subject: {schedule.subject.name}
                      </Typography>
                      <Typography variant="body2">
                        Date: {formatDate(schedule.date)}
                      </Typography>
                      <Typography variant="body2">
                        Time: {formatTime(schedule.time)}
                      </Typography>
                      <Typography variant="body2">
                        Duration: {schedule.duration}
                      </Typography>
                      <Typography variant="body2">
                        Teacher:{" "}
                        {schedule.teacher
                          ? schedule.teacher.user.first_name
                          : ""}
                      </Typography>
                      {schedule?.exam && (
                        <Typography variant="body2">
                          Exam: {schedule?.exam.name}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction={"row"} gap={1}>
                      <IconButton onClick={() => handleAddToEdit(schedule)}>
                        <EditIcon color="warning" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleRemoveItem(schedule.uuid)}
                      >
                        <RemoveCircleIcon color="error" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              ))}
              <CustomButton
                onClick={handleSubmit}
                disabled={isLoading}
                fullWidth
                sx={{ mt: 2 }}
              >
                Save
              </CustomButton>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewScheduleList;
