import { Grid } from "@mui/material";
import NewScheduleList from "../components/NewScheduleList/NewScheduleList";
import ScheduleAddForm from "../components/scheduleForm/scheduleAddForm";

const AddSchedule = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <ScheduleAddForm />
      </Grid>
      <Grid item xs={12} md={6}>
        <NewScheduleList />
      </Grid>
    </Grid>
  );
};

export default AddSchedule;
